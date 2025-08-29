/**
 * RecoveryStrategies
 * 個別復旧戦略実装、破損検出・処理、部分損失復旧、バージョン不一致解決を担当
 */
export class RecoveryStrategies {
    constructor(dataRecovery) {
        this.dataRecovery = dataRecovery;
        this.statisticsManager = dataRecovery.statisticsManager;
        this.errorHandler = dataRecovery.errorHandler;
        
        // 復旧戦略マップ
        this.strategies = new Map([
            ['corruption', this.recoverFromCorruption.bind(this)],
            ['partial_loss', this.recoverFromPartialLoss.bind(this)],
            ['version_mismatch', this.recoverFromVersionMismatch.bind(this)],
            ['checksum_failure', this.recoverFromChecksumFailure.bind(this)],
            ['structure_damage', this.recoverFromStructureDamage.bind(this)],
            ['complete_loss', this.recoverFromCompleteLoss.bind(this)]
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
        
        console.log('[RecoveryStrategies] Component initialized');
    }
    
    /**
     * 復旧戦略を実行
     * @param {string} strategyName 戦略名
     * @param {Object} analysis 分析結果
     * @param {Object} options オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async executeStrategy(strategyName, analysis, options = {}) {
        try {
            const strategy = this.strategies.get(strategyName);
            if (!strategy) {
                throw new Error(`Unknown recovery strategy: ${strategyName}`);
            }
            
            console.log(`[RecoveryStrategies] Executing strategy: ${strategyName}`);
            this.dataRecovery.updateProgress(`recovery_${strategyName}`, 0);
            
            const result = await strategy(analysis, options);
            
            this.dataRecovery.updateProgress(`recovery_${strategyName}`, 100);
            console.log(`[RecoveryStrategies] Strategy completed: ${strategyName}`);
            
            return result;
        } catch (error) {
            this.errorHandler.handleError(error, 'RECOVERY_STRATEGY_ERROR', {
                strategy: strategyName,
                analysis,
                options
            });
            throw error;
        }
    }
    
    /**
     * データ破損からの復旧
     * @param {Object} analysis 破損分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromCorruption(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting corruption recovery');
        
        try {
            const { corruptedData, corruptionLevel, corruptedFields } = analysis;
            const recoveredData = { ...corruptedData };
            const repairLog = [];
            
            // 軽度な破損の場合：フィールド単位で修復
            if (corruptionLevel < 0.3) {
                for (const field of corruptedFields) {
                    const repaired = await this._repairCorruptedField(field, recoveredData[field]);
                    if (repaired.success) {
                        recoveredData[field] = repaired.data;
                        repairLog.push(`Repaired field: ${field}`);
                    }
                }
            }
            // 中度な破損の場合：統計的補間
            else if (corruptionLevel < 0.7) {
                const interpolated = await this._interpolateCorruptedData(recoveredData, analysis);
                Object.assign(recoveredData, interpolated.data);
                repairLog.push(...interpolated.log);
            }
            // 重度な破損の場合：バックアップから復元
            else {
                const backup = await this.statisticsManager.getLatestBackup();
                if (backup) {
                    Object.assign(recoveredData, backup.data);
                    repairLog.push('Restored from backup due to severe corruption');
                } else {
                    // バックアップがない場合は初期化
                    const defaultData = this.statisticsManager.getDefaultStatistics();
                    Object.assign(recoveredData, defaultData);
                    repairLog.push('Initialized with default data - no backup available');
                }
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'corruption_repair',
                corruptionLevel,
                fieldsRepaired: corruptedFields.length
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Corruption recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'corruption_repair'
            };
        }
    }
    
    /**
     * 部分データ損失からの復旧
     * @param {Object} analysis 損失分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromPartialLoss(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting partial loss recovery');
        
        try {
            const { partialData, missingFields, dataIntegrity } = analysis;
            const recoveredData = { ...partialData };
            const repairLog = [];
            
            // 優先度順に欠損フィールドを復旧
            for (const field of this.recoveryPriority) {
                if (missingFields.includes(field)) {
                    const recovered = await this._recoverMissingField(field, recoveredData);
                    if (recovered.success) {
                        recoveredData[field] = recovered.data;
                        repairLog.push(`Recovered missing field: ${field}`);
                    } else {
                        // デフォルト値で初期化
                        const defaultValue = this._getDefaultFieldValue(field);
                        recoveredData[field] = defaultValue;
                        repairLog.push(`Initialized field with default: ${field}`);
                    }
                }
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'partial_loss_recovery',
                fieldsRecovered: missingFields.length,
                dataIntegrity
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Partial loss recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'partial_loss_recovery'
            };
        }
    }
    
    /**
     * バージョン不一致からの復旧
     * @param {Object} analysis バージョン分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromVersionMismatch(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting version mismatch recovery');
        
        try {
            const { oldData, currentVersion, dataVersion } = analysis;
            const migratedData = { ...oldData };
            const migrationLog = [];
            
            // バージョン間マイグレーション
            const migrationResult = await this._migrateDataToVersion(
                migratedData, 
                dataVersion, 
                currentVersion
            );
            
            if (migrationResult.success) {
                Object.assign(migratedData, migrationResult.data);
                migrationLog.push(...migrationResult.log);
            } else {
                // マイグレーション失敗時は構造を現在のバージョンに合わせて初期化
                const currentStructure = this.statisticsManager.getDefaultStatistics();
                const converted = this._convertToCurrentStructure(oldData, currentStructure);
                Object.assign(migratedData, converted.data);
                migrationLog.push(...converted.log);
            }
            
            return {
                success: true,
                data: migratedData,
                migrationLog,
                recoveryMethod: 'version_migration',
                fromVersion: dataVersion,
                toVersion: currentVersion
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Version mismatch recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'version_migration'
            };
        }
    }
    
    /**
     * チェックサム失敗からの復旧
     * @param {Object} analysis チェックサム分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromChecksumFailure(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting checksum failure recovery');
        
        try {
            const { data, expectedChecksum, actualChecksum } = analysis;
            const recoveredData = { ...data };
            const repairLog = [];
            
            // データの整合性を検証し、問題のある部分を特定
            const integrityCheck = await this.dataRecovery.analyzeDataIntegrity(data);
            
            if (integrityCheck.isValid) {
                // データ自体は有効なので、チェックサムを再計算
                const newChecksum = this.dataRecovery.calculateChecksum(recoveredData);
                repairLog.push(`Recalculated checksum: ${expectedChecksum} -> ${newChecksum}`);
                
                return {
                    success: true,
                    data: recoveredData,
                    repairLog,
                    recoveryMethod: 'checksum_recalculation',
                    newChecksum
                };
            } else {
                // データに問題がある場合は破損として処理
                return await this.recoverFromCorruption({
                    corruptedData: data,
                    corruptionLevel: 1 - integrityCheck.validFieldsRatio,
                    corruptedFields: integrityCheck.invalidFields
                }, options);
            }
            
        } catch (error) {
            console.error('[RecoveryStrategies] Checksum failure recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'checksum_recovery'
            };
        }
    }
    
    /**
     * 構造破損からの復旧
     * @param {Object} analysis 構造分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromStructureDamage(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting structure damage recovery');
        
        try {
            const { damagedData, expectedStructure, structureDamage } = analysis;
            const recoveredData = {};
            const repairLog = [];
            
            // 期待される構造に基づいてデータを再構築
            const rebuilt = this.dataRecovery.repairObjectStructure(damagedData, expectedStructure);
            Object.assign(recoveredData, rebuilt);
            repairLog.push('Rebuilt data structure based on expected schema');
            
            // 失われたフィールドをデフォルト値で補完
            for (const field of structureDamage.missingFields || []) {
                const defaultValue = this._getDefaultFieldValue(field);
                recoveredData[field] = defaultValue;
                repairLog.push(`Added missing field with default: ${field}`);
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'structure_rebuild',
                missingFields: structureDamage.missingFields?.length || 0
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Structure damage recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'structure_rebuild'
            };
        }
    }
    
    /**
     * 完全データ損失からの復旧
     * @param {Object} analysis 損失分析結果
     * @param {Object} options 復旧オプション
     * @returns {Promise<Object>} 復旧結果
     */
    async recoverFromCompleteLoss(analysis, options = {}) {
        console.log('[RecoveryStrategies] Starting complete loss recovery');
        
        try {
            const repairLog = [];
            let recoveredData = null;
            
            // 1. 最新のバックアップから復元を試行
            const latestBackup = await this.statisticsManager.getLatestBackup();
            if (latestBackup && latestBackup.data) {
                recoveredData = { ...latestBackup.data };
                repairLog.push(`Restored from backup: ${latestBackup.timestamp}`);
            }
            
            // 2. バックアップがない場合は履歴データから復元を試行
            if (!recoveredData) {
                const historyData = await this.statisticsManager.getHistoricalData();
                if (historyData && historyData.length > 0) {
                    recoveredData = this._reconstructFromHistory(historyData);
                    repairLog.push('Reconstructed from historical data');
                }
            }
            
            // 3. 全て失敗した場合はデフォルトデータで初期化
            if (!recoveredData) {
                recoveredData = this.statisticsManager.getDefaultStatistics();
                repairLog.push('Initialized with default statistics (complete data loss)');
            }
            
            return {
                success: true,
                data: recoveredData,
                repairLog,
                recoveryMethod: 'complete_recovery',
                dataSource: latestBackup ? 'backup' : 'default'
            };
            
        } catch (error) {
            console.error('[RecoveryStrategies] Complete loss recovery failed:', error);
            return {
                success: false,
                error: error.message,
                recoveryMethod: 'complete_recovery'
            };
        }
    }
    
    /**
     * 破損フィールドを修復
     * @param {string} fieldName フィールド名
     * @param {*} corruptedValue 破損した値
     * @returns {Promise<Object>} 修復結果
     * @private
     */
    async _repairCorruptedField(fieldName, corruptedValue) {
        try {
            // フィールドタイプに応じた修復戦略
            const fieldType = this._getFieldType(fieldName);
            
            switch (fieldType) {
                case 'number':
                    const repaired = this._repairNumericField(corruptedValue);
                    return { success: true, data: repaired };
                    
                case 'object':
                    const template = this._getFieldTemplate(fieldName);
                    const repairedObj = this.dataRecovery.repairObjectStructure(corruptedValue, template);
                    return { success: true, data: repairedObj };
                    
                case 'array':
                    const repairedArray = this._repairArrayField(corruptedValue);
                    return { success: true, data: repairedArray };
                    
                default:
                    return { success: false, error: `Unknown field type: ${fieldType}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 数値フィールドを修復
     * @param {*} value 破損した値
     * @returns {number} 修復された値
     * @private
     */
    _repairNumericField(value) {
        if (typeof value === 'number' && !isNaN(value)) {
            return Math.max(0, value); // 負の値は0に修正
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
                return Math.max(0, parsed);
            }
        }
        return 0; // 修復不可能な場合は0
    }
    
    /**
     * 配列フィールドを修復
     * @param {*} value 破損した値
     * @returns {Array} 修復された配列
     * @private
     */
    _repairArrayField(value) {
        if (Array.isArray(value)) {
            return value.filter(item => item !== null && item !== undefined);
        }
        return []; // 修復不可能な場合は空配列
    }
    
    /**
     * 欠損フィールドを復旧
     * @param {string} fieldName フィールド名
     * @param {Object} existingData 既存データ
     * @returns {Promise<Object>} 復旧結果
     * @private
     */
    async _recoverMissingField(fieldName, existingData) {
        try {
            // 関連するフィールドから推定
            const estimatedValue = this._estimateFieldValue(fieldName, existingData);
            return { success: true, data: estimatedValue };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * フィールド値を推定
     * @param {string} fieldName フィールド名
     * @param {Object} existingData 既存データ
     * @returns {*} 推定値
     * @private
     */
    _estimateFieldValue(fieldName, existingData) {
        // フィールドタイプに応じた推定ロジック
        switch (fieldName) {
            case 'totalGamesPlayed':
                return Math.max(1, existingData.wins || 0 + existingData.losses || 0);
            case 'totalScore':
                return (existingData.averageScore || 0) * (existingData.totalGamesPlayed || 1);
            case 'playTime':
                return (existingData.totalGamesPlayed || 1) * 300000; // 5分平均と仮定
            default:
                return this._getDefaultFieldValue(fieldName);
        }
    }
    
    /**
     * デフォルトフィールド値を取得
     * @param {string} fieldName フィールド名
     * @returns {*} デフォルト値
     * @private
     */
    _getDefaultFieldValue(fieldName) {
        const defaults = this.statisticsManager.getDefaultStatistics();
        return this._getNestedValue(defaults, fieldName) || 0;
    }
    
    /**
     * ネストした値を取得
     * @param {Object} obj オブジェクト
     * @param {string} path ドット記法のパス
     * @returns {*} 値
     * @private
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * フィールドタイプを取得
     * @param {string} fieldName フィールド名
     * @returns {string} フィールドタイプ
     * @private
     */
    _getFieldType(fieldName) {
        const numericFields = ['totalScore', 'averageScore', 'playTime', 'totalGamesPlayed'];
        const objectFields = ['bubbleStats', 'comboStats', 'achievementStats'];
        const arrayFields = ['recentScores', 'sessionHistory'];
        
        if (numericFields.includes(fieldName)) return 'number';
        if (objectFields.includes(fieldName)) return 'object';
        if (arrayFields.includes(fieldName)) return 'array';
        return 'unknown';
    }
    
    /**
     * フィールドテンプレートを取得
     * @param {string} fieldName フィールド名
     * @returns {Object} テンプレート
     * @private
     */
    _getFieldTemplate(fieldName) {
        const templates = {
            bubbleStats: { normal: 0, electric: 0, diamond: 0, rainbow: 0 },
            comboStats: { maxCombo: 0, totalCombos: 0, averageCombo: 0 },
            achievementStats: { total: 0, unlocked: 0, progress: {} }
        };
        return templates[fieldName] || {};
    }
    
    /**
     * 利用可能な戦略一覧を取得
     * @returns {Array} 戦略名のリスト
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
    
    /**
     * 戦略の統計情報を取得
     * @returns {Object} 戦略統計
     */
    getStrategyStats() {
        return {
            totalStrategies: this.strategies.size,
            availableStrategies: this.getAvailableStrategies(),
            recoveryPriority: [...this.recoveryPriority]
        };
    }
}