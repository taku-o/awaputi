import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * データ検証管理クラス - 包括的なデータ検証システム
 * 
 * 責任:
 * - データ構造の検証
 * - データ整合性チェック
 * - チェックサム計算・検証
 * - 検証ルールエンジン
 */
export class ValidationManager {
    private gameEngine: any;
    private version: string;
    private validationRules: Map<string, any>;
    private customValidators: Map<string, (data: any) => any>;
    private checksumAlgorithm: string;
    private statistics: any;

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        this.version = '1.0.0';
        
        // 検証ルール
        this.validationRules = new Map();
        this.customValidators = new Map();
        this.checksumAlgorithm = 'sha256';
        
        // 検証統計
        this.statistics = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            lastValidation: null
        };
        
        this.initialize();
    }
    
    /**
     * ValidationManagerの初期化
     */
    initialize(): void {
        try {
            // デフォルト検証ルールの設定
            this.setupDefaultValidationRules();
            // カスタムバリデーターの登録
            this.registerCustomValidators();
            console.log('ValidationManager initialized');
        } catch (error) {
            getErrorHandler().handleError(error, 'VALIDATION_MANAGER_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * デフォルト検証ルールの設定
     */
    setupDefaultValidationRules(): void {
        this.validationRules.set('playerData', {
            type: 'object',
            required: ['username', 'currentHP', 'maxHP', 'ap', 'tap'],
            properties: {
                username: {
                    type: 'string',
                    maxLength: 50,
                    pattern: /^[\w\s\-\.]*$/
                },
                currentHP: {
                    type: 'number',
                    min: 0,
                    max: 1000,
                    integer: true
                },
                maxHP: {
                    type: 'number',
                    min: 1,
                    max: 1000,
                    integer: true
                },
                currentScore: {
                    type: 'number',
                    min: 0,
                    max: 999999999,
                    integer: true
                },
                ap: {
                    type: 'number',
                    min: 0,
                    max: 999999999,
                    integer: true
                },
                tap: {
                    type: 'number',
                    min: 0,
                    max: 999999999,
                    integer: true
                },
                combo: {
                    type: 'number',
                    min: 0,
                    max: 10000,
                    integer: true
                },
                highScores: {
                    type: 'object',
                    additionalProperties: {
                        type: 'number',
                        min: 0,
                        max: 999999999
                    }
                },
                unlockedStages: {
                    type: 'array',
                    items: {
                        type: 'string',
                        maxLength: 20
                    }
                },
                ownedItems: {
                    type: 'array',
                    items: {
                        type: 'string',
                        maxLength: 30
                    }
                }
            }
        });
        
        // 設定データの検証ルール
        this.validationRules.set('settings', {
            type: 'object',
            properties: {
                masterVolume: {
                    type: 'number',
                    min: 0,
                    max: 1
                },
                sfxVolume: {
                    type: 'number',
                    min: 0,
                    max: 1
                },
                bgmVolume: {
                    type: 'number',
                    min: 0,
                    max: 1
                },
                language: {
                    type: 'string',
                    enum: ['ja', 'en']
                },
                quality: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'auto']
                }
            }
        });
        
        // 統計データの検証ルール
        this.validationRules.set('statistics', {
            type: 'object',
            properties: {
                totalPlayTime: {
                    type: 'number',
                    min: 0,
                    max: 365 * 24 * 60 * 60 * 1000 // 1年分のミリ秒
                },
                totalGamesPlayed: {
                    type: 'number',
                    min: 0,
                    max: 1000000,
                    integer: true
                },
                totalBubblesPopped: {
                    type: 'number',
                    min: 0,
                    max: 999999999,
                    integer: true
                },
                maxCombo: {
                    type: 'number',
                    min: 0,
                    max: 10000,
                    integer: true
                },
                averageScore: {
                    type: 'number',
                    min: 0,
                    max: 999999999
                }
            }
        });
        
        // バックアップデータの検証ルール
        this.validationRules.set('backup', {
            type: 'object',
            required: ['metadata', 'data'],
            properties: {
                metadata: {
                    type: 'object',
                    required: ['version', 'timestamp', 'checksum'],
                    properties: {
                        version: {
                            type: 'string',
                            pattern: /^\d+\.\d+\.\d+$/
                        },
                        timestamp: {
                            type: 'number',
                            min: 1640995200000, // 2022-01-01
                            max: Date.now()
                        },
                        checksum: {
                            type: 'string',
                            minLength: 32
                        }
                    }
                },
                data: {
                    type: 'object'
                }
            }
        });
    }
    
    /**
     * カスタムバリデーターの登録
     */
    registerCustomValidators(): void {
        this.customValidators.set('hpConsistency', (data) => {
            if (data.currentHP > data.maxHP) {
                return {
                    isValid: false,
                    errors: ['Current HP cannot exceed max HP']
                };
            }
            return { isValid: true, errors: [] };
        });
        
        // ステージアンロック整合性チェック
        this.customValidators.set('stageUnlockConsistency', (data) => {
            const requiredStages = ['tutorial', 'normal'];
            const missing = requiredStages.filter(stage => 
                !data.unlockedStages.includes(stage)
            );
            if (missing.length > 0) {
                return {
                    isValid: false,
                    errors: [`Missing required stages: ${missing.join(', ')}`]
                };
            }
            return { isValid: true, errors: [] };
        });
        
        // スコア整合性チェック
        this.customValidators.set('scoreConsistency', (data) => {
            if (data.currentScore < 0) {
                return {
                    isValid: false,
                    errors: ['Score cannot be negative']
                };
            }
            
            // ハイスコアとの整合性チェック
            if (data.highScores) {
                for (const [stage, score] of Object.entries(data.highScores)) {
                    if ((score as number) < 0 || (score as number) > 999999999) {
                        return {
                            isValid: false,
                            errors: [`Invalid high score for stage ${stage}: ${score}`]
                        };
                    }
                }
            }
            
            return { isValid: true, errors: [] };
        });
        
        // タイムスタンプ検証
        this.customValidators.set('timestampValidation', (data) => {
            const now = Date.now();
            const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
            const oneDayFromNow = now + (24 * 60 * 60 * 1000);
            
            if (data.timestamp < oneYearAgo || data.timestamp > oneDayFromNow) {
                return {
                    isValid: false,
                    errors: [`Invalid timestamp: ${data.timestamp}`]
                };
            }
            return { isValid: true, errors: [] };
        });
    }
    
    /**
     * データの包括的検証
     */
    async validate(dataType: string, data: any, options: any = {}): Promise<any> {
        try {
            this.statistics.totalValidations++;
            const startTime = performance.now();
            const result = {
                isValid: true,
                errors: [],
                warnings: [],
                details: {},
                checksum: null,
                validationTime: 0
            };
            
            // 基本構造検証
            const structureValidation = await this.validateStructure(dataType, data);
            if (!structureValidation.isValid) {
                result.isValid = false;
                result.errors.push(...structureValidation.errors);
            }
            result.details.structure = structureValidation;
            
            // データ型検証
            const typeValidation = await this.validateTypes(dataType, data);
            if (!typeValidation.isValid) {
                result.isValid = false;
                result.errors.push(...typeValidation.errors);
            }
            result.details.types = typeValidation;
            
            // カスタム検証ルール
            const customValidation = await this.validateCustomRules(dataType, data);
            if (!customValidation.isValid) {
                result.isValid = false;
                result.errors.push(...customValidation.errors);
            }
            result.details.custom = customValidation;
            
            // チェックサム計算
            if (options.calculateChecksum !== false) {
                result.checksum = await this.calculateChecksum(data);
            }
            
            // 整合性チェック
            if (options.integrityCheck !== false) {
                const integrityValidation = await this.validateIntegrity(dataType, data);
                if (!integrityValidation.isValid) {
                    result.isValid = false;
                    result.errors.push(...integrityValidation.errors);
                } else if (integrityValidation.warnings) {
                    result.warnings.push(...integrityValidation.warnings);
                }
                result.details.integrity = integrityValidation;
            }
            
            const endTime = performance.now();
            result.validationTime = endTime - startTime;
            
            // 統計更新
            if (result.isValid) {
                this.statistics.successfulValidations++;
            } else {
                this.statistics.failedValidations++;
            }
            this.statistics.lastValidation = {
                dataType,
                timestamp: Date.now(),
                isValid: result.isValid,
                duration: result.validationTime
            };
            
            return result;
            
        } catch (error) {
            this.statistics.failedValidations++;
            getErrorHandler().handleError(error, 'VALIDATION_ERROR', {
                operation: 'validate',
                dataType
            });
            
            return {
                isValid: false,
                errors: [`Validation failed: ${error.message}`],
                warnings: [],
                details: {},
                checksum: null,
                validationTime: 0
            };
        }
    }
    
    /**
     * データ構造の検証
     */
    async validateStructure(dataType: string, data: any): Promise<any> {
        try {
            const rule = this.validationRules.get(dataType);
            if (!rule) {
                return {
                    isValid: true,
                    errors: [],
                    message: 'No validation rule found for data type'
                };
            }
            
            const errors = [];
            
            // 必須フィールドのチェック
            if (rule.required) {
                for (const field of rule.required) {
                    if (!(field in data)) {
                        errors.push(`Required field missing: ${field}`);
                    } else if (data[field] === null || data[field] === undefined) {
                        errors.push(`Required field is null or undefined: ${field}`);
                    }
                }
            }
            
            // 基本型チェック
            if (rule.type && typeof data !== rule.type) {
                if (!(rule.type === 'array' && Array.isArray(data))) {
                    errors.push(`Expected type ${rule.type}, got ${typeof data}`);
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                checkedFields: rule.required || []
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'STRUCTURE_VALIDATION_ERROR', {
                operation: 'validateStructure',
                dataType
            });
            
            return {
                isValid: false,
                errors: [`Structure validation failed: ${error.message}`]
            };
        }
    }
    
    /**
     * データ型の検証
     */
    async validateTypes(dataType: string, data: any): Promise<any> {
        try {
            const rule = this.validationRules.get(dataType);
            if (!rule || !rule.properties) {
                return { isValid: true, errors: [] };
            }
            
            const errors = [];
            
            for (const [fieldName, fieldRule] of Object.entries(rule.properties)) {
                if (!(fieldName in data)) {
                    continue; // 必須チェックは構造検証で実施済み
                }
                
                const value = data[fieldName];
                const fieldValidation = this.validateField(fieldName, value, fieldRule);
                
                if (!fieldValidation.isValid) {
                    errors.push(...fieldValidation.errors);
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                validatedFields: Object.keys(rule.properties)
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'TYPE_VALIDATION_ERROR', {
                operation: 'validateTypes',
                dataType
            });
            
            return {
                isValid: false,
                errors: [`Type validation failed: ${error.message}`]
            };
        }
    }
    
    /**
     * 個別フィールドの検証
     */
    validateField(fieldName: string, value: any, rule: any): any {
        const errors = [];
        
        try {
            // 型チェック
            if (rule.type) {
                if (rule.type === 'array' && !Array.isArray(value)) {
                    errors.push(`${fieldName}: Expected array, got ${typeof value}`);
                } else if (rule.type !== 'array' && typeof value !== rule.type) {
                    errors.push(`${fieldName}: Expected ${rule.type}, got ${typeof value}`);
                }
            }
            
            // 文字列の検証
            if (rule.type === 'string' && typeof value === 'string') {
                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`${fieldName}: Too short (min: ${rule.minLength})`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${fieldName}: Too long (max: ${rule.maxLength})`);
                }
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${fieldName}: Does not match required pattern`);
                }
                if (rule.enum && !rule.enum.includes(value)) {
                    errors.push(`${fieldName}: Invalid value (allowed: ${rule.enum.join(', ')})`);
                }
            }
            
            // 数値の検証
            if (rule.type === 'number' && typeof value === 'number') {
                if (rule.min !== undefined && value < rule.min) {
                    errors.push(`${fieldName}: Too small (min: ${rule.min})`);
                }
                if (rule.max !== undefined && value > rule.max) {
                    errors.push(`${fieldName}: Too large (max: ${rule.max})`);
                }
                if (rule.integer && !Number.isInteger(value)) {
                    errors.push(`${fieldName}: Must be an integer`);
                }
                if (isNaN(value) || !isFinite(value)) {
                    errors.push(`${fieldName}: Invalid number value`);
                }
            }
            
            // 配列の検証
            if (rule.type === 'array' && Array.isArray(value)) {
                if (rule.minItems && value.length < rule.minItems) {
                    errors.push(`${fieldName}: Too few items (min: ${rule.minItems})`);
                }
                if (rule.maxItems && value.length > rule.maxItems) {
                    errors.push(`${fieldName}: Too many items (max: ${rule.maxItems})`);
                }
                
                // 配列アイテムの検証
                if (rule.items) {
                    value.forEach((item, index) => {
                        const itemValidation = this.validateField(`${fieldName}[${index}]`, item, rule.items);
                        if (!itemValidation.isValid) {
                            errors.push(...itemValidation.errors);
                        }
                    });
                }
            }
            
            // オブジェクトの検証
            if (rule.type === 'object' && typeof value === 'object' && value !== null) {
                if (rule.additionalProperties) {
                    for (const [key, val] of Object.entries(value)) {
                        const propValidation = this.validateField(`${fieldName}.${key}`, val, rule.additionalProperties);
                        if (!propValidation.isValid) {
                            errors.push(...propValidation.errors);
                        }
                    }
                }
            }
        } catch (error) {
            errors.push(`${fieldName}: Validation error - ${error.message}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * カスタム検証ルールの実行
     */
    async validateCustomRules(dataType: string, data: any): Promise<any> {
        try {
            const errors = [];
            const warnings = [];
            
            // データタイプ固有のカスタム検証
            switch (dataType) {
                case 'playerData':
                    // HP整合性チェック
                    const hpCheck = this.customValidators.get('hpConsistency')?.(data);
                    if (hpCheck && !hpCheck.isValid) {
                        errors.push(...hpCheck.errors);
                    }
                    
                    // ステージアンロック整合性チェック
                    const stageCheck = this.customValidators.get('stageUnlockConsistency')?.(data);
                    if (stageCheck && !stageCheck.isValid) {
                        errors.push(...stageCheck.errors);
                    }
                    
                    // スコア整合性チェック
                    const scoreCheck = this.customValidators.get('scoreConsistency')?.(data);
                    if (scoreCheck && !scoreCheck.isValid) {
                        errors.push(...scoreCheck.errors);
                    }
                    break;
                    
                case 'backup':
                    // タイムスタンプ検証
                    if (data.metadata && data.metadata.timestamp) {
                        const timestampCheck = this.customValidators.get('timestampValidation')?.(data.metadata);
                        if (timestampCheck && !timestampCheck.isValid) {
                            errors.push(...timestampCheck.errors);
                        }
                    }
                    break;
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                rulesApplied: Array.from(this.customValidators.keys())
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CUSTOM_VALIDATION_ERROR', {
                operation: 'validateCustomRules',
                dataType
            });
            
            return {
                isValid: false,
                errors: [`Custom validation failed: ${error.message}`],
                warnings: []
            };
        }
    }
    
    /**
     * データ整合性の検証
     */
    async validateIntegrity(dataType: string, data: any): Promise<any> {
        try {
            const warnings = [];
            const errors = [];
            
            // データサイズチェック
            const dataSize = JSON.stringify(data).length;
            if (dataSize > 1024 * 1024) { // 1MB
                warnings.push(`Large data size: ${(dataSize / 1024 / 1024).toFixed(2)}MB`);
            }
            
            // 循環参照チェック
            try {
                JSON.stringify(data);
            } catch (error) {
                if (error.message.includes('circular')) {
                    errors.push('Circular reference detected in data structure');
                }
            }
            
            // 日付の妥当性チェック
            if (data.timestamp) {
                const now = Date.now();
                const age = now - data.timestamp;
                
                if (age < 0) {
                    warnings.push('Data timestamp is in the future');
                } else if (age > 365 * 24 * 60 * 60 * 1000) { // 1年以上
                    warnings.push(`Data is very old: ${Math.floor(age / (24 * 60 * 60 * 1000))} days`);
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
                dataSize,
                checks: ['size', 'circularReference', 'timestamp']
            };
            
        } catch (error) {
            getErrorHandler().handleError(error, 'INTEGRITY_VALIDATION_ERROR', {
                operation: 'validateIntegrity',
                dataType
            });
            
            return {
                isValid: false,
                errors: [`Integrity validation failed: ${error.message}`],
                warnings: []
            };
        }
    }
    
    /**
     * チェックサムの計算
     */
    async calculateChecksum(data: any): Promise<string> {
        try {
            const dataString = JSON.stringify(data, Object.keys(data).sort());
            // Web Crypto APIを使用したSHA-256（利用可能な場合）
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(dataString);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            
            // フォールバック: シンプルなハッシュ
            return this.simpleHash(dataString);
            
        } catch (error) {
            getErrorHandler().handleError(error, 'CHECKSUM_CALCULATION_ERROR', {
                operation: 'calculateChecksum'
            });
            
            // フォールバック
            return this.simpleHash(JSON.stringify(data));
        }
    }
    
    /**
     * シンプルハッシュ関数（フォールバック用）
     */
    simpleHash(str: string): string {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }
    
    /**
     * チェックサムの検証
     */
    async verifyChecksum(data: any, expectedChecksum: string): Promise<boolean> {
        try {
            const calculatedChecksum = await this.calculateChecksum(data);
            return calculatedChecksum === expectedChecksum;
        } catch (error) {
            getErrorHandler().handleError(error, 'CHECKSUM_VERIFICATION_ERROR', {
                operation: 'verifyChecksum'
            });
            return false;
        }
    }
    
    /**
     * 検証統計の取得
     */
    getStatistics(): any {
        return {
            ...this.statistics,
            successRate: this.statistics.totalValidations > 0
                ? (this.statistics.successfulValidations / this.statistics.totalValidations * 100).toFixed(2) + '%'
                : '0%'
        };
    }
    
    /**
     * カスタムバリデーターの追加
     */
    addCustomValidator(name: string, validator: (data: any) => any): void {
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }
        
        this.customValidators.set(name, validator);
    }
    
    /**
     * 検証ルールの追加/更新
     */
    setValidationRule(dataType: string, rule: any): void {
        this.validationRules.set(dataType, rule);
    }
    
    /**
     * リソースの解放
     */
    destroy(): void {
        try {
            this.validationRules.clear();
            this.customValidators.clear();
            console.log('ValidationManager destroyed');
        } catch (error) {
            getErrorHandler().handleError(error, 'VALIDATION_MANAGER_DESTROY_ERROR', {
                operation: 'destroy'
            });
        }
    }
}