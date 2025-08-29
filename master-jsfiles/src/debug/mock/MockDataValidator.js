import { BaseComponent } from '../BaseComponent.js';

/**
 * MockDataValidator - モックデータの検証・品質チェックコンポーネント
 */
export class MockDataValidator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'MockDataValidator');
        this.validationRules = new Map();
        this.qualityChecks = new Map();
        this.statistics = {
            validations: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    async _doInitialize() {
        this.setupValidationRules();
        this.setupQualityChecks();
    }

    setupValidationRules() {
        // 泡データ検証ルール
        this.validationRules.set('bubble', {
            required: ['id', 'type', 'size', 'position'],
            types: {
                id: 'string',
                type: 'string',
                size: 'number',
                health: 'number',
                score: 'number'
            },
            ranges: {
                size: [10, 150],
                health: [1, 50],
                score: [1, 10000]
            }
        });

        // プレイヤーデータ検証ルール
        this.validationRules.set('player', {
            required: ['id', 'name', 'level', 'totalScore'],
            types: {
                id: 'string',
                name: 'string',
                level: 'number',
                totalScore: 'number',
                accuracy: 'number'
            },
            ranges: {
                level: [1, 100],
                totalScore: [0, 1000000],
                accuracy: [0, 1]
            }
        });

        // ゲーム状態検証ルール
        this.validationRules.set('gameState', {
            required: ['id', 'state', 'timestamp'],
            types: {
                id: 'string',
                state: 'string',
                timestamp: 'number',
                score: 'number',
                level: 'number'
            },
            ranges: {
                score: [0, 1000000],
                level: [1, 50],
                lives: [0, 10]
            }
        });
    }

    setupQualityChecks() {
        this.qualityChecks.set('consistency', this.checkDataConsistency.bind(this));
        this.qualityChecks.set('completeness', this.checkDataCompleteness.bind(this));
        this.qualityChecks.set('realism', this.checkDataRealism.bind(this));
        this.qualityChecks.set('diversity', this.checkDataDiversity.bind(this));
    }

    /**
     * データを検証
     * @param {*} data - 検証対象データ
     * @param {string} type - データタイプ
     * @returns {Object} 検証結果
     */
    validateData(data, type) {
        this.statistics.validations++;
        
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            type: type,
            timestamp: Date.now()
        };

        try {
            const rules = this.validationRules.get(type);
            if (!rules) {
                result.warnings.push(`No validation rules found for type: ${type}`);
                this.statistics.warnings++;
                return result;
            }

            // 必須フィールドチェック
            this.validateRequiredFields(data, rules.required, result);
            
            // タイプチェック
            this.validateTypes(data, rules.types, result);
            
            // 範囲チェック
            this.validateRanges(data, rules.ranges, result);
            
            // カスタム検証
            this.validateCustomRules(data, type, result);

            if (result.errors.length > 0) {
                result.valid = false;
                this.statistics.failed++;
            } else {
                this.statistics.passed++;
            }

        } catch (error) {
            result.valid = false;
            result.errors.push(`Validation error: ${error.message}`);
            this.statistics.failed++;
        }

        return result;
    }

    /**
     * 必須フィールドを検証
     * @param {*} data - データ
     * @param {Array} required - 必須フィールド
     * @param {Object} result - 結果オブジェクト
     */
    validateRequiredFields(data, required, result) {
        if (!required) return;
        
        required.forEach(field => {
            if (!(field in data) || data[field] === null || data[field] === undefined) {
                result.errors.push(`Missing required field: ${field}`);
            }
        });
    }

    /**
     * データタイプを検証
     * @param {*} data - データ
     * @param {Object} types - タイプ定義
     * @param {Object} result - 結果オブジェクト
     */
    validateTypes(data, types, result) {
        if (!types) return;
        
        Object.entries(types).forEach(([field, expectedType]) => {
            if (field in data) {
                const actualType = typeof data[field];
                if (actualType !== expectedType) {
                    result.errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
                }
            }
        });
    }

    /**
     * 値の範囲を検証
     * @param {*} data - データ
     * @param {Object} ranges - 範囲定義
     * @param {Object} result - 結果オブジェクト
     */
    validateRanges(data, ranges, result) {
        if (!ranges) return;
        
        Object.entries(ranges).forEach(([field, [min, max]]) => {
            if (field in data) {
                const value = data[field];
                if (typeof value === 'number') {
                    if (value < min || value > max) {
                        result.errors.push(`Value out of range for ${field}: ${value} (expected ${min}-${max})`);
                    }
                }
            }
        });
    }

    /**
     * カスタム検証ルール
     * @param {*} data - データ
     * @param {string} type - データタイプ
     * @param {Object} result - 結果オブジェクト
     */
    validateCustomRules(data, type, result) {
        switch (type) {
            case 'bubble':
                this.validateBubbleCustom(data, result);
                break;
            case 'player':
                this.validatePlayerCustom(data, result);
                break;
            case 'gameState':
                this.validateGameStateCustom(data, result);
                break;
        }
    }

    /**
     * 泡データのカスタム検証
     * @param {Object} data - 泡データ
     * @param {Object} result - 結果オブジェクト
     */
    validateBubbleCustom(data, result) {
        // 位置検証
        if (data.position) {
            if (typeof data.position.x !== 'number' || typeof data.position.y !== 'number') {
                result.errors.push('Position must have numeric x and y coordinates');
            }
        }
        
        // 色検証
        if (data.color && typeof data.color === 'string') {
            if (!data.color.match(/^#[0-9A-Fa-f]{6}$/)) {
                result.warnings.push('Color should be in hex format (#RRGGBB)');
            }
        }
        
        // エフェクト検証
        if (data.effects && Array.isArray(data.effects)) {
            const validEffects = ['none', 'glow', 'pulse', 'rotate', 'fade', 'bounce'];
            data.effects.forEach(effect => {
                if (!validEffects.includes(effect)) {
                    result.warnings.push(`Unknown effect: ${effect}`);
                }
            });
        }
    }

    /**
     * プレイヤーデータのカスタム検証
     * @param {Object} data - プレイヤーデータ
     * @param {Object} result - 結果オブジェクト
     */
    validatePlayerCustom(data, result) {
        // 統計の整合性チェック
        if (data.gamesPlayed && data.gamesWon) {
            if (data.gamesWon > data.gamesPlayed) {
                result.errors.push('Games won cannot exceed games played');
            }
        }
        
        // スコアの整合性チェック
        if (data.totalScore && data.highScore) {
            if (data.highScore > data.totalScore && data.gamesPlayed === 1) {
                // 1ゲームの場合はOK
            } else if (data.highScore > data.totalScore) {
                result.errors.push('High score cannot exceed total score for multiple games');
            }
        }
        
        // 精度の妥当性チェック
        if (data.accuracy && (data.accuracy < 0 || data.accuracy > 1)) {
            result.errors.push('Accuracy must be between 0 and 1');
        }
    }

    /**
     * ゲーム状態のカスタム検証
     * @param {Object} data - ゲーム状態データ
     * @param {Object} result - 結果オブジェクト
     */
    validateGameStateCustom(data, result) {
        // 状態の妥当性チェック
        const validStates = ['menu', 'playing', 'paused', 'game_over', 'level_complete', 'loading'];
        if (data.state && !validStates.includes(data.state)) {
            result.warnings.push(`Unknown game state: ${data.state}`);
        }
        
        // タイムスタンプの妥当性チェック
        if (data.timestamp) {
            const now = Date.now();
            if (data.timestamp > now) {
                result.errors.push('Timestamp cannot be in the future');
            }
            if (data.timestamp < now - 31536000000) { // 1年前より古い
                result.warnings.push('Timestamp is older than 1 year');
            }
        }
    }

    /**
     * データの整合性をチェック
     * @param {Array} dataSet - データセット
     * @returns {Object} チェック結果
     */
    checkDataConsistency(dataSet) {
        const result = {
            passed: true,
            issues: [],
            score: 1.0
        };

        if (!Array.isArray(dataSet) || dataSet.length === 0) {
            result.passed = false;
            result.issues.push('Dataset is empty or not an array');
            result.score = 0;
            return result;
        }

        // IDの重複チェック
        const ids = dataSet.map(item => item.id).filter(id => id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            result.passed = false;
            result.issues.push('Duplicate IDs found in dataset');
            result.score -= 0.3;
        }

        // データ構造の一貫性チェック
        const firstItem = dataSet[0];
        const referenceKeys = Object.keys(firstItem);
        
        dataSet.forEach((item, index) => {
            const itemKeys = Object.keys(item);
            if (itemKeys.length !== referenceKeys.length) {
                result.issues.push(`Item ${index} has different number of properties`);
                result.score -= 0.1;
            }
        });

        return result;
    }

    /**
     * データの完全性をチェック
     * @param {Array} dataSet - データセット
     * @returns {Object} チェック結果
     */
    checkDataCompleteness(dataSet) {
        const result = {
            passed: true,
            issues: [],
            score: 1.0,
            completeness: 0
        };

        if (!Array.isArray(dataSet) || dataSet.length === 0) {
            result.passed = false;
            result.issues.push('No data to check');
            return result;
        }

        let totalFields = 0;
        let filledFields = 0;

        dataSet.forEach(item => {
            Object.entries(item).forEach(([key, value]) => {
                totalFields++;
                if (value !== null && value !== undefined && value !== '') {
                    filledFields++;
                }
            });
        });

        result.completeness = totalFields > 0 ? filledFields / totalFields : 0;
        
        if (result.completeness < 0.8) {
            result.passed = false;
            result.issues.push(`Low completeness: ${(result.completeness * 100).toFixed(1)}%`);
        }

        result.score = result.completeness;
        return result;
    }

    /**
     * データの現実性をチェック
     * @param {Array} dataSet - データセット
     * @returns {Object} チェック結果
     */
    checkDataRealism(dataSet) {
        const result = {
            passed: true,
            issues: [],
            score: 1.0
        };

        if (!Array.isArray(dataSet) || dataSet.length === 0) {
            return result;
        }

        // 数値の分布チェック
        const numericFields = this.getNumericFields(dataSet);
        
        numericFields.forEach(field => {
            const values = dataSet.map(item => item[field]).filter(v => typeof v === 'number');
            if (values.length > 0) {
                const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
                const stdDev = this.mainController.calculateStandardDeviation(values);
                
                // 異常値の検出
                const outliers = values.filter(v => Math.abs(v - mean) > 3 * stdDev);
                if (outliers.length > values.length * 0.1) {
                    result.issues.push(`Too many outliers in field ${field}: ${outliers.length}`);
                    result.score -= 0.1;
                }
            }
        });

        return result;
    }

    /**
     * データの多様性をチェック
     * @param {Array} dataSet - データセット
     * @returns {Object} チェック結果
     */
    checkDataDiversity(dataSet) {
        const result = {
            passed: true,
            issues: [],
            score: 1.0,
            diversity: {}
        };

        if (!Array.isArray(dataSet) || dataSet.length === 0) {
            return result;
        }

        // 各フィールドの多様性を計算
        const fields = Object.keys(dataSet[0] || {});
        
        fields.forEach(field => {
            const values = dataSet.map(item => item[field]);
            const uniqueValues = new Set(values);
            const diversity = uniqueValues.size / values.length;
            
            result.diversity[field] = diversity;
            
            if (diversity < 0.1 && values.length > 10) {
                result.issues.push(`Low diversity in field ${field}: ${(diversity * 100).toFixed(1)}%`);
                result.score -= 0.1;
            }
        });

        return result;
    }

    /**
     * 数値フィールドを取得
     * @param {Array} dataSet - データセット
     * @returns {Array} 数値フィールド名の配列
     */
    getNumericFields(dataSet) {
        if (dataSet.length === 0) return [];
        
        const firstItem = dataSet[0];
        return Object.keys(firstItem).filter(key => 
            typeof firstItem[key] === 'number'
        );
    }

    /**
     * 包括的品質チェックを実行
     * @param {Array} dataSet - データセット
     * @param {string} type - データタイプ
     * @returns {Object} 品質レポート
     */
    runQualityAssessment(dataSet, type) {
        const report = {
            type: type,
            timestamp: Date.now(),
            dataCount: Array.isArray(dataSet) ? dataSet.length : 0,
            overallScore: 0,
            checks: {},
            recommendations: []
        };

        // 各品質チェックを実行
        for (const [checkName, checkFunction] of this.qualityChecks) {
            try {
                report.checks[checkName] = checkFunction(dataSet);
            } catch (error) {
                report.checks[checkName] = {
                    passed: false,
                    issues: [`Check failed: ${error.message}`],
                    score: 0
                };
            }
        }

        // 全体スコアを計算
        const scores = Object.values(report.checks).map(check => check.score || 0);
        report.overallScore = scores.length > 0 ? 
            scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        // 推奨事項を生成
        report.recommendations = this.generateRecommendations(report);

        return report;
    }

    /**
     * 推奨事項を生成
     * @param {Object} report - 品質レポート
     * @returns {Array} 推奨事項
     */
    generateRecommendations(report) {
        const recommendations = [];

        if (report.overallScore < 0.7) {
            recommendations.push('Overall data quality is low. Consider reviewing generation parameters.');
        }

        Object.entries(report.checks).forEach(([checkName, result]) => {
            if (!result.passed || result.score < 0.8) {
                switch (checkName) {
                    case 'consistency':
                        recommendations.push('Improve data consistency by standardizing field structures.');
                        break;
                    case 'completeness':
                        recommendations.push('Reduce null/empty values to improve completeness.');
                        break;
                    case 'realism':
                        recommendations.push('Adjust value ranges to be more realistic.');
                        break;
                    case 'diversity':
                        recommendations.push('Increase variation in generated values.');
                        break;
                }
            }
        });

        return recommendations;
    }

    /**
     * 検証統計を取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return {
            ...this.statistics,
            successRate: this.statistics.validations > 0 ? 
                this.statistics.passed / this.statistics.validations : 0
        };
    }

    /**
     * 統計をリセット
     */
    resetStatistics() {
        this.statistics = {
            validations: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }
}