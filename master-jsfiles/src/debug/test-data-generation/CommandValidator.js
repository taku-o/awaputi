import { BaseComponent } from '../BaseComponent.js';

/**
 * CommandValidator - コマンドパラメータ検証・構文チェックコンポーネント
 */
export class CommandValidator extends BaseComponent {
    constructor(mainController) {
        super(mainController, 'CommandValidator');
        this.validationRules = new Map();
        this.parameterTypes = new Map();
        this.commandSchemas = new Map();
        this.validationHistory = [];
    }

    async _doInitialize() {
        this.setupValidationRules();
        this.setupParameterTypes();
        this.setupCommandSchemas();
    }

    /**
     * 検証ルールを設定
     */
    setupValidationRules() {
        // 数値検証ルール
        this.validationRules.set('number', {
            validate: (value, constraints = {}) => {
                const num = Number(value);
                if (isNaN(num)) {
                    return { valid: false, error: `"${value}" is not a valid number` };
                }
                
                if (constraints.min !== undefined && num < constraints.min) {
                    return { valid: false, error: `Number must be >= ${constraints.min}, got ${num}` };
                }
                
                if (constraints.max !== undefined && num > constraints.max) {
                    return { valid: false, error: `Number must be <= ${constraints.max}, got ${num}` };
                }
                
                if (constraints.integer && !Number.isInteger(num)) {
                    return { valid: false, error: `Number must be an integer, got ${num}` };
                }
                
                return { valid: true, value: num };
            }
        });

        // 文字列検証ルール
        this.validationRules.set('string', {
            validate: (value, constraints = {}) => {
                if (typeof value !== 'string') {
                    return { valid: false, error: `Expected string, got ${typeof value}` };
                }
                
                if (constraints.minLength !== undefined && value.length < constraints.minLength) {
                    return { valid: false, error: `String must be at least ${constraints.minLength} characters, got ${value.length}` };
                }
                
                if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
                    return { valid: false, error: `String must be at most ${constraints.maxLength} characters, got ${value.length}` };
                }
                
                if (constraints.enum && !constraints.enum.includes(value)) {
                    return { valid: false, error: `String must be one of [${constraints.enum.join(', ')}], got "${value}"` };
                }
                
                if (constraints.pattern && !constraints.pattern.test(value)) {
                    return { valid: false, error: `String does not match required pattern: "${value}"` };
                }
                
                return { valid: true, value };
            }
        });

        // JSON検証ルール
        this.validationRules.set('json', {
            validate: (value, constraints = {}) => {
                if (typeof value !== 'string') {
                    return { valid: false, error: `Expected JSON string, got ${typeof value}` };
                }
                
                try {
                    const parsed = JSON.parse(value);
                    
                    if (constraints.type && typeof parsed !== constraints.type) {
                        return { valid: false, error: `JSON must parse to ${constraints.type}, got ${typeof parsed}` };
                    }
                    
                    if (constraints.requiredKeys) {
                        for (const key of constraints.requiredKeys) {
                            if (!(key in parsed)) {
                                return { valid: false, error: `JSON must contain key "${key}"` };
                            }
                        }
                    }
                    
                    return { valid: true, value: parsed };
                } catch (error) {
                    return { valid: false, error: `Invalid JSON: ${error.message}` };
                }
            }
        });

        // 配列検証ルール
        this.validationRules.set('array', {
            validate: (value, constraints = {}) => {
                if (!Array.isArray(value)) {
                    return { valid: false, error: `Expected array, got ${typeof value}` };
                }
                
                if (constraints.minLength !== undefined && value.length < constraints.minLength) {
                    return { valid: false, error: `Array must have at least ${constraints.minLength} items, got ${value.length}` };
                }
                
                if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
                    return { valid: false, error: `Array must have at most ${constraints.maxLength} items, got ${value.length}` };
                }
                
                return { valid: true, value };
            }
        });
    }

    /**
     * パラメータタイプを設定
     */
    setupParameterTypes() {
        // バブル数パラメータ
        this.parameterTypes.set('bubbleCount', {
            type: 'number',
            constraints: { min: 1, max: 1000, integer: true },
            description: 'Number of bubbles to generate'
        });

        // バブルタイプパラメータ
        this.parameterTypes.set('bubbleType', {
            type: 'string',
            constraints: { 
                enum: ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky', 'escaping', 'boss', 'random']
            },
            description: 'Type of bubble to generate'
        });

        // シナリオパラメータ
        this.parameterTypes.set('scenario', {
            type: 'string',
            constraints: { 
                enum: ['normal', 'stress', 'boss', 'combo', 'critical']
            },
            description: 'Game scenario to apply'
        });

        // プロファイルパラメータ
        this.parameterTypes.set('profile', {
            type: 'string',
            constraints: { 
                enum: ['beginner', 'experienced', 'expert', 'random']
            },
            description: 'Player profile type'
        });

        // 期間パラメータ
        this.parameterTypes.set('period', {
            type: 'string',
            constraints: { 
                enum: ['daily', 'weekly', 'monthly', 'session']
            },
            description: 'Statistics period'
        });

        // 強度パラメータ
        this.parameterTypes.set('intensity', {
            type: 'string',
            constraints: { 
                enum: ['low', 'medium', 'high', 'extreme']
            },
            description: 'Test intensity level'
        });

        // 設定タイプパラメータ
        this.parameterTypes.set('configType', {
            type: 'string',
            constraints: { 
                enum: ['game', 'audio', 'effects', 'performance']
            },
            description: 'Configuration type'
        });

        // エラータイプパラメータ
        this.parameterTypes.set('errorType', {
            type: 'string',
            constraints: { 
                enum: ['memory', 'network', 'render', 'logic', 'crash']
            },
            description: 'Error simulation type'
        });

        // コンポーネントパラメータ
        this.parameterTypes.set('component', {
            type: 'string',
            constraints: { 
                enum: ['bubbles', 'rendering', 'audio', 'memory', 'all']
            },
            description: 'System component to test'
        });

        // 期間（秒）パラメータ
        this.parameterTypes.set('duration', {
            type: 'number',
            constraints: { min: 1, max: 600, integer: true },
            description: 'Duration in seconds'
        });
    }

    /**
     * コマンドスキーマを設定
     */
    setupCommandSchemas() {
        // test.bubbles コマンドスキーマ
        this.commandSchemas.set('test.bubbles', {
            parameters: [
                { name: 'count', type: 'bubbleCount', required: false, default: 10 },
                { name: 'type', type: 'bubbleType', required: false, default: 'random' },
                { name: 'options', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Generate test bubbles with specified parameters'
        });

        // test.gamestate コマンドスキーマ
        this.commandSchemas.set('test.gamestate', {
            parameters: [
                { name: 'scenario', type: 'scenario', required: true },
                { name: 'parameters', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Generate specific game state for testing'
        });

        // test.playerdata コマンドスキーマ
        this.commandSchemas.set('test.playerdata', {
            parameters: [
                { name: 'profile', type: 'profile', required: true },
                { name: 'overrides', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Generate test player data'
        });

        // test.statistics コマンドスキーマ
        this.commandSchemas.set('test.statistics', {
            parameters: [
                { name: 'period', type: 'period', required: true },
                { name: 'data', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Generate test statistics data'
        });

        // test.performance コマンドスキーマ
        this.commandSchemas.set('test.performance', {
            parameters: [
                { name: 'scenario', type: 'string', required: true, constraints: { enum: ['memory', 'cpu', 'rendering', 'particles'] } },
                { name: 'intensity', type: 'intensity', required: false, default: 'medium' }
            ],
            description: 'Generate performance test scenarios'
        });

        // test.config コマンドスキーマ
        this.commandSchemas.set('test.config', {
            parameters: [
                { name: 'type', type: 'configType', required: true },
                { name: 'scenario', type: 'string', required: false, default: 'default', constraints: { enum: ['default', 'minimal', 'maximal', 'broken'] } }
            ],
            description: 'Generate test configurations'
        });

        // test.errors コマンドスキーマ
        this.commandSchemas.set('test.errors', {
            parameters: [
                { name: 'type', type: 'errorType', required: true },
                { name: 'parameters', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Simulate various error conditions'
        });

        // test.stress コマンドスキーマ
        this.commandSchemas.set('test.stress', {
            parameters: [
                { name: 'component', type: 'component', required: true },
                { name: 'duration', type: 'duration', required: false, default: 30 },
                { name: 'options', type: 'json', required: false, constraints: { type: 'object' } }
            ],
            description: 'Run stress tests for performance evaluation'
        });

        // test.clear コマンドスキーマ
        this.commandSchemas.set('test.clear', {
            parameters: [
                { name: 'type', type: 'string', required: false, default: 'all' }
            ],
            description: 'Clear generated test data'
        });

        // test.list コマンドスキーマ
        this.commandSchemas.set('test.list', {
            parameters: [
                { name: 'category', type: 'string', required: false, constraints: { enum: ['generators', 'scenarios', 'data'] } }
            ],
            description: 'List available test data and scenarios'
        });
    }

    /**
     * コマンドとパラメータを検証
     * @param {string} command - コマンド名
     * @param {Array} args - 引数配列
     * @returns {Object} 検証結果
     */
    validateCommand(command, args = []) {
        const validationResult = {
            valid: true,
            errors: [],
            warnings: [],
            parsedArgs: [],
            command,
            timestamp: Date.now()
        };

        try {
            // コマンドスキーマを取得
            const schema = this.commandSchemas.get(command);
            if (!schema) {
                validationResult.valid = false;
                validationResult.errors.push(`Unknown command: ${command}`);
                return validationResult;
            }

            // パラメータを検証
            for (let i = 0; i < schema.parameters.length; i++) {
                const paramDef = schema.parameters[i];
                const argValue = args[i];

                // 必須パラメータのチェック
                if (paramDef.required && (argValue === undefined || argValue === null || argValue === '')) {
                    validationResult.valid = false;
                    validationResult.errors.push(`Required parameter "${paramDef.name}" is missing`);
                    continue;
                }

                // 値が提供されていない場合、デフォルト値を使用
                let valueToValidate = argValue;
                if (valueToValidate === undefined && paramDef.default !== undefined) {
                    valueToValidate = paramDef.default;
                    validationResult.warnings.push(`Using default value for "${paramDef.name}": ${paramDef.default}`);
                }

                // 値が提供されている場合のみ検証
                if (valueToValidate !== undefined) {
                    const typeValidation = this.validateParameter(paramDef, valueToValidate);
                    
                    if (!typeValidation.valid) {
                        validationResult.valid = false;
                        validationResult.errors.push(`Parameter "${paramDef.name}": ${typeValidation.error}`);
                    } else {
                        validationResult.parsedArgs[i] = typeValidation.value;
                    }
                } else {
                    validationResult.parsedArgs[i] = undefined;
                }
            }

            // 余分な引数の警告
            if (args.length > schema.parameters.length) {
                const extraArgs = args.slice(schema.parameters.length);
                validationResult.warnings.push(`Extra arguments ignored: [${extraArgs.join(', ')}]`);
            }

            // 検証履歴に追加
            this.addValidationHistory(validationResult);

            return validationResult;

        } catch (error) {
            this._handleError('command validation', error);
            validationResult.valid = false;
            validationResult.errors.push(`Validation error: ${error.message}`);
            return validationResult;
        }
    }

    /**
     * 個別パラメータを検証
     * @param {Object} paramDef - パラメータ定義
     * @param {*} value - 検証する値
     * @returns {Object} 検証結果
     */
    validateParameter(paramDef, value) {
        try {
            // パラメータタイプ定義を取得
            const typeInfo = this.parameterTypes.get(paramDef.type);
            
            if (typeInfo) {
                // 定義済みタイプの場合
                const validator = this.validationRules.get(typeInfo.type);
                if (validator) {
                    return validator.validate(value, { ...typeInfo.constraints, ...paramDef.constraints });
                }
            }

            // 基本タイプの場合
            const validator = this.validationRules.get(paramDef.type);
            if (validator) {
                return validator.validate(value, paramDef.constraints || {});
            }

            // 検証ルールが見つからない場合
            return { valid: false, error: `Unknown parameter type: ${paramDef.type}` };

        } catch (error) {
            return { valid: false, error: `Parameter validation error: ${error.message}` };
        }
    }

    /**
     * コマンド構文をチェック
     * @param {string} commandLine - コマンドライン
     * @returns {Object} 構文チェック結果
     */
    validateSyntax(commandLine) {
        const syntaxResult = {
            valid: true,
            errors: [],
            warnings: [],
            command: null,
            args: [],
            timestamp: Date.now()
        };

        try {
            if (!commandLine || typeof commandLine !== 'string') {
                syntaxResult.valid = false;
                syntaxResult.errors.push('Command line must be a non-empty string');
                return syntaxResult;
            }

            // コマンドラインを解析
            const trimmed = commandLine.trim();
            if (!trimmed) {
                syntaxResult.valid = false;
                syntaxResult.errors.push('Command line is empty');
                return syntaxResult;
            }

            // シンプルな引数分割（将来的にはより高度な解析も可能）
            const parts = trimmed.split(/\s+/);
            syntaxResult.command = parts[0];
            syntaxResult.args = parts.slice(1);

            // コマンド名の検証
            if (!syntaxResult.command.startsWith('test.')) {
                syntaxResult.warnings.push('Command does not start with "test." prefix');
            }

            // 引数の基本的な構文チェック
            for (let i = 0; i < syntaxResult.args.length; i++) {
                const arg = syntaxResult.args[i];
                
                // JSON引数の基本的な構文チェック
                if (arg.startsWith('{') || arg.startsWith('[')) {
                    try {
                        JSON.parse(arg);
                    } catch (error) {
                        syntaxResult.errors.push(`Argument ${i + 1} appears to be malformed JSON: ${error.message}`);
                        syntaxResult.valid = false;
                    }
                }
            }

            return syntaxResult;

        } catch (error) {
            this._handleError('syntax validation', error);
            syntaxResult.valid = false;
            syntaxResult.errors.push(`Syntax validation error: ${error.message}`);
            return syntaxResult;
        }
    }

    /**
     * パラメータヒントを生成
     * @param {string} command - コマンド名
     * @param {number} paramIndex - パラメータインデックス
     * @returns {Object} パラメータヒント
     */
    generateParameterHints(command, paramIndex = 0) {
        const schema = this.commandSchemas.get(command);
        if (!schema || paramIndex >= schema.parameters.length) {
            return null;
        }

        const paramDef = schema.parameters[paramIndex];
        const typeInfo = this.parameterTypes.get(paramDef.type);

        return {
            name: paramDef.name,
            type: paramDef.type,
            required: paramDef.required,
            default: paramDef.default,
            description: typeInfo ? typeInfo.description : paramDef.description,
            constraints: typeInfo ? typeInfo.constraints : paramDef.constraints,
            examples: this.generateParameterExamples(paramDef, typeInfo)
        };
    }

    /**
     * パラメータ例を生成
     * @param {Object} paramDef - パラメータ定義
     * @param {Object} typeInfo - タイプ情報
     * @returns {Array} 例の配列
     */
    generateParameterExamples(paramDef, typeInfo) {
        const constraints = { ...typeInfo?.constraints, ...paramDef.constraints };
        
        if (constraints.enum) {
            return constraints.enum.slice(0, 3); // 最初の3つの例
        }

        switch (paramDef.type) {
            case 'bubbleCount':
                return ['10', '20', '50'];
            case 'duration':
                return ['30', '60', '120'];
            case 'json':
                return ['{}', '{"key": "value"}', '{"count": 10}'];
            default:
                return [];
        }
    }

    /**
     * 検証履歴に追加
     * @param {Object} validationResult - 検証結果
     */
    addValidationHistory(validationResult) {
        this.validationHistory.push({
            timestamp: Date.now(),
            ...validationResult
        });

        // 履歴サイズを制限（最大100件）
        if (this.validationHistory.length > 100) {
            this.validationHistory = this.validationHistory.slice(-100);
        }
    }

    /**
     * 検証統計を取得
     * @returns {Object} 検証統計
     */
    getValidationStatistics() {
        const recent = this.validationHistory.slice(-20);
        const totalValidations = this.validationHistory.length;
        const successfulValidations = this.validationHistory.filter(v => v.valid).length;

        return {
            totalValidations,
            successfulValidations,
            successRate: totalValidations > 0 ? (successfulValidations / totalValidations) * 100 : 0,
            recentValidations: recent.length,
            averageErrorsPerValidation: totalValidations > 0 ? 
                this.validationHistory.reduce((sum, v) => sum + v.errors.length, 0) / totalValidations : 0,
            mostCommonErrors: this.getMostCommonErrors()
        };
    }

    /**
     * 最も一般的なエラーを取得
     * @returns {Array} エラーの頻度順リスト
     */
    getMostCommonErrors() {
        const errorCounts = new Map();
        
        for (const validation of this.validationHistory) {
            for (const error of validation.errors) {
                const count = errorCounts.get(error) || 0;
                errorCounts.set(error, count + 1);
            }
        }

        return Array.from(errorCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));
    }

    /**
     * 利用可能なコマンドを取得
     * @returns {Array} コマンド一覧
     */
    getAvailableCommands() {
        return Array.from(this.commandSchemas.entries()).map(([command, schema]) => ({
            command,
            description: schema.description,
            parameters: schema.parameters.length
        }));
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.validationRules.clear();
        this.parameterTypes.clear();
        this.commandSchemas.clear();
        this.validationHistory = [];
        super.cleanup();
    }
}