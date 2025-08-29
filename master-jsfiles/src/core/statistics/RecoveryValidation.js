/**
 * RecoveryValidation
 * データ整合性検証、チェックサム検証、構造検証、範囲検証、データ一貫性チェックを担当
 */
export class RecoveryValidation {
    constructor(dataRecovery) {
        this.dataRecovery = dataRecovery;
        this.statisticsManager = dataRecovery.statisticsManager;
        this.errorHandler = dataRecovery.errorHandler;
        
        // データ検証規則
        this.validationRules = new Map([
            ['gamePlayStats', this.validateGamePlayStats.bind(this)],
            ['scoreStats', this.validateScoreStats.bind(this)],
            ['bubbleStats', this.validateBubbleStats.bind(this)],
            ['comboStats', this.validateComboStats.bind(this)],
            ['timeStats', this.validateTimeStats.bind(this)],
            ['achievementStats', this.validateAchievementStats.bind(this)],
            ['sessionStats', this.validateSessionStats.bind(this)]
        ]);
        
        // 検証設定
        this.validationConfig = {
            strictMode: false,
            validateChecksums: true,
            validateStructure: true,
            validateRanges: true,
            allowPartialValidation: true
        };
        
        // 検証統計
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            lastValidationTime: null
        };
        
        console.log('[RecoveryValidation] Component initialized');
    }
    
    /**
     * データ整合性を分析
     * @param {Object} data 検証対象データ
     * @returns {Promise<Object>} 整合性分析結果
     */
    async analyzeDataIntegrity(data) {
        try {
            console.log('[RecoveryValidation] Starting data integrity analysis');
            
            const analysis = {
                isValid: true,
                validFields: [],
                invalidFields: [],
                validFieldsRatio: 0,
                integrityScore: 0,
                errors: [],
                warnings: []
            };
            
            let totalFields = 0;
            let validFields = 0;
            
            // 各フィールドを検証
            for (const [fieldName, validationFn] of this.validationRules.entries()) {
                if (data.hasOwnProperty(fieldName)) {
                    totalFields++;
                    
                    try {
                        const isValid = await validationFn(data[fieldName]);
                        if (isValid) {
                            validFields++;
                            analysis.validFields.push(fieldName);
                        } else {
                            analysis.invalidFields.push(fieldName);
                            analysis.errors.push(`Invalid field: ${fieldName}`);
                        }
                    } catch (error) {
                        analysis.invalidFields.push(fieldName);
                        analysis.errors.push(`Validation error for ${fieldName}: ${error.message}`);
                    }
                }
            }
            
            // 整合性スコアを計算
            analysis.validFieldsRatio = totalFields > 0 ? validFields / totalFields : 0;
            analysis.integrityScore = analysis.validFieldsRatio * 100;
            analysis.isValid = analysis.validFieldsRatio >= 0.7; // 70%以上で有効とみなす
            
            // 統計更新
            this.validationStats.totalValidations++;
            if (analysis.isValid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            this.validationStats.lastValidationTime = Date.now();
            
            console.log(`[RecoveryValidation] Integrity analysis completed: ${analysis.integrityScore}%`);
            return analysis;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DATA_INTEGRITY_ANALYSIS_ERROR', { data });
            return {
                isValid: false,
                validFields: [],
                invalidFields: [],
                validFieldsRatio: 0,
                integrityScore: 0,
                errors: [error.message],
                warnings: []
            };
        }
    }
    
    /**
     * データ破損を分析
     * @param {Object} data 分析対象データ
     * @returns {Promise<Object>} 破損分析結果
     */
    async analyzeDataCorruption(data) {
        try {
            console.log('[RecoveryValidation] Starting data corruption analysis');
            
            const corruption = {
                isCorrupted: false,
                corruptionLevel: 0,
                corruptedFields: [],
                corruptionTypes: [],
                repairability: 'high',
                analysis: {}
            };
            
            // データ型チェック
            const typeCheck = this._checkDataTypes(data);
            if (typeCheck.hasIssues) {
                corruption.corruptedFields.push(...typeCheck.corruptedFields);
                corruption.corruptionTypes.push('type_mismatch');
            }
            
            // 値範囲チェック
            const rangeCheck = this._checkDataRanges(data);
            if (rangeCheck.hasIssues) {
                corruption.corruptedFields.push(...rangeCheck.corruptedFields);
                corruption.corruptionTypes.push('range_violation');
            }
            
            // 構造整合性チェック
            const structureCheck = this._checkDataStructure(data);
            if (structureCheck.hasIssues) {
                corruption.corruptedFields.push(...structureCheck.corruptedFields);
                corruption.corruptionTypes.push('structure_damage');
            }
            
            // 論理整合性チェック
            const logicCheck = this._checkLogicalConsistency(data);
            if (logicCheck.hasIssues) {
                corruption.corruptedFields.push(...logicCheck.corruptedFields);
                corruption.corruptionTypes.push('logical_inconsistency');
            }
            
            // 破損レベルを計算
            const totalFields = Object.keys(data).length;
            const uniqueCorruptedFields = [...new Set(corruption.corruptedFields)];
            corruption.corruptionLevel = totalFields > 0 ? uniqueCorruptedFields.length / totalFields : 0;
            corruption.isCorrupted = corruption.corruptionLevel > 0;
            
            // 修復可能性を評価
            if (corruption.corruptionLevel < 0.3) {
                corruption.repairability = 'high';
            } else if (corruption.corruptionLevel < 0.7) {
                corruption.repairability = 'medium';
            } else {
                corruption.repairability = 'low';
            }
            
            corruption.analysis = {
                typeCheck,
                rangeCheck,
                structureCheck,
                logicCheck
            };
            
            console.log(`[RecoveryValidation] Corruption analysis completed: ${corruption.corruptionLevel * 100}%`);
            return corruption;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'DATA_CORRUPTION_ANALYSIS_ERROR', { data });
            return {
                isCorrupted: true,
                corruptionLevel: 1.0,
                corruptedFields: Object.keys(data),
                corruptionTypes: ['analysis_error'],
                repairability: 'low',
                analysis: { error: error.message }
            };
        }
    }
    
    /**
     * チェックサムを計算
     * @param {Object} data データオブジェクト
     * @returns {string} チェックサム
     */
    calculateChecksum(data) {
        try {
            const serialized = JSON.stringify(data, Object.keys(data).sort());
            let hash = 0;
            
            for (let i = 0; i < serialized.length; i++) {
                const char = serialized.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // 32bit integer
            }
            
            return Math.abs(hash).toString(16);
        } catch (error) {
            console.warn('[RecoveryValidation] Checksum calculation failed:', error);
            return '0';
        }
    }
    
    /**
     * データ構造を検証
     * @param {Object} data データオブジェクト
     * @returns {Object} 検証結果
     */
    validateDataStructure(data) {
        try {
            const expectedStructure = this.statisticsManager.getDefaultStatistics();
            const validation = {
                isValid: true,
                missingFields: [],
                extraFields: [],
                typeErrors: []
            };
            
            // 必須フィールドの存在確認
            for (const key of Object.keys(expectedStructure)) {
                if (!(key in data)) {
                    validation.missingFields.push(key);
                    validation.isValid = false;
                }
            }
            
            // 余分なフィールドの確認
            for (const key of Object.keys(data)) {
                if (!(key in expectedStructure)) {
                    validation.extraFields.push(key);
                }
            }
            
            // データ型の確認
            for (const [key, expectedValue] of Object.entries(expectedStructure)) {
                if (key in data) {
                    const expectedType = typeof expectedValue;
                    const actualType = typeof data[key];
                    
                    if (expectedType !== actualType) {
                        validation.typeErrors.push({
                            field: key,
                            expected: expectedType,
                            actual: actualType
                        });
                        validation.isValid = false;
                    }
                }
            }
            
            return validation;
        } catch (error) {
            return {
                isValid: false,
                missingFields: [],
                extraFields: [],
                typeErrors: [],
                error: error.message
            };
        }
    }
    
    /**
     * データ範囲を検証
     * @param {Object} data データオブジェクト
     * @returns {Object} 検証結果
     */
    validateDataRanges(data) {
        try {
            const validation = {
                isValid: true,
                rangeErrors: []
            };
            
            // 数値フィールドの範囲チェック
            const numericRanges = {
                totalScore: { min: 0, max: Number.MAX_SAFE_INTEGER },
                averageScore: { min: 0, max: 100000 },
                playTime: { min: 0, max: Number.MAX_SAFE_INTEGER },
                totalGamesPlayed: { min: 0, max: Number.MAX_SAFE_INTEGER },
                winRate: { min: 0, max: 1 }
            };
            
            for (const [field, range] of Object.entries(numericRanges)) {
                if (field in data && typeof data[field] === 'number') {
                    if (data[field] < range.min || data[field] > range.max) {
                        validation.rangeErrors.push({
                            field,
                            value: data[field],
                            expected: range
                        });
                        validation.isValid = false;
                    }
                }
            }
            
            return validation;
        } catch (error) {
            return {
                isValid: false,
                rangeErrors: [],
                error: error.message
            };
        }
    }
    
    /**
     * ゲームプレイ統計を検証
     * @param {Object} data ゲームプレイデータ
     * @returns {boolean} 検証結果
     */
    validateGamePlayStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['totalGamesPlayed', 'wins', 'losses'];
        for (const field of requiredFields) {
            if (!(field in data) || typeof data[field] !== 'number' || data[field] < 0) {
                return false;
            }
        }
        
        // 論理的整合性チェック
        if (data.totalGamesPlayed !== data.wins + data.losses) {
            return false;
        }
        
        return true;
    }
    
    /**
     * スコア統計を検証
     * @param {Object} data スコアデータ
     * @returns {boolean} 検証結果
     */
    validateScoreStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['totalScore', 'averageScore', 'highestScore'];
        for (const field of requiredFields) {
            if (!(field in data) || typeof data[field] !== 'number' || data[field] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * バブル統計を検証
     * @param {Object} data バブルデータ
     * @returns {boolean} 検証結果
     */
    validateBubbleStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredBubbleTypes = ['normal', 'electric', 'diamond', 'rainbow'];
        for (const bubbleType of requiredBubbleTypes) {
            if (!(bubbleType in data) || typeof data[bubbleType] !== 'number' || data[bubbleType] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * コンボ統計を検証
     * @param {Object} data コンボデータ
     * @returns {boolean} 検証結果
     */
    validateComboStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['maxCombo', 'totalCombos', 'averageCombo'];
        for (const field of requiredFields) {
            if (!(field in data) || typeof data[field] !== 'number' || data[field] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 時間統計を検証
     * @param {Object} data 時間データ
     * @returns {boolean} 検証結果
     */
    validateTimeStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['playTime', 'averageSessionTime'];
        for (const field of requiredFields) {
            if (!(field in data) || typeof data[field] !== 'number' || data[field] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 実績統計を検証
     * @param {Object} data 実績データ
     * @returns {boolean} 検証結果
     */
    validateAchievementStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredFields = ['total', 'unlocked'];
        for (const field of requiredFields) {
            if (!(field in data) || typeof data[field] !== 'number' || data[field] < 0) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * セッション統計を検証
     * @param {Object} data セッションデータ
     * @returns {boolean} 検証結果
     */
    validateSessionStats(data) {
        if (!data || typeof data !== 'object') return false;
        
        if ('recentSessions' in data && !Array.isArray(data.recentSessions)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * データ型をチェック
     * @param {Object} data データオブジェクト
     * @returns {Object} チェック結果
     * @private
     */
    _checkDataTypes(data) {
        const result = {
            hasIssues: false,
            corruptedFields: []
        };
        
        const expectedTypes = {
            totalScore: 'number',
            averageScore: 'number',
            playTime: 'number',
            totalGamesPlayed: 'number',
            bubbleStats: 'object',
            comboStats: 'object'
        };
        
        for (const [field, expectedType] of Object.entries(expectedTypes)) {
            if (field in data && typeof data[field] !== expectedType) {
                result.hasIssues = true;
                result.corruptedFields.push(field);
            }
        }
        
        return result;
    }
    
    /**
     * データ範囲をチェック
     * @param {Object} data データオブジェクト
     * @returns {Object} チェック結果
     * @private
     */
    _checkDataRanges(data) {
        const result = {
            hasIssues: false,
            corruptedFields: []
        };
        
        const numericFields = ['totalScore', 'averageScore', 'playTime', 'totalGamesPlayed'];
        for (const field of numericFields) {
            if (field in data && typeof data[field] === 'number' && data[field] < 0) {
                result.hasIssues = true;
                result.corruptedFields.push(field);
            }
        }
        
        return result;
    }
    
    /**
     * データ構造をチェック
     * @param {Object} data データオブジェクト
     * @returns {Object} チェック結果
     * @private
     */
    _checkDataStructure(data) {
        const result = {
            hasIssues: false,
            corruptedFields: []
        };
        
        const requiredFields = ['totalScore', 'totalGamesPlayed', 'bubbleStats'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                result.hasIssues = true;
                result.corruptedFields.push(field);
            }
        }
        
        return result;
    }
    
    /**
     * 論理的整合性をチェック
     * @param {Object} data データオブジェクト
     * @returns {Object} チェック結果
     * @private
     */
    _checkLogicalConsistency(data) {
        const result = {
            hasIssues: false,
            corruptedFields: []
        };
        
        // ゲーム数の整合性チェック
        if ('wins' in data && 'losses' in data && 'totalGamesPlayed' in data) {
            if (data.totalGamesPlayed !== data.wins + data.losses) {
                result.hasIssues = true;
                result.corruptedFields.push('totalGamesPlayed', 'wins', 'losses');
            }
        }
        
        return result;
    }
    
    /**
     * 検証設定を更新
     * @param {Object} config 新しい検証設定
     */
    updateValidationConfig(config) {
        Object.assign(this.validationConfig, config);
        console.log('[RecoveryValidation] Validation config updated');
    }
    
    /**
     * 検証統計を取得
     * @returns {Object} 検証統計
     */
    getValidationStats() {
        return {
            ...this.validationStats,
            availableRules: Array.from(this.validationRules.keys()),
            config: { ...this.validationConfig }
        };
    }
    
    /**
     * 検証統計をリセット
     */
    resetValidationStats() {
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            lastValidationTime: null
        };
        
        console.log('[RecoveryValidation] Validation statistics reset');
    }
}