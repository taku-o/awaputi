import { BaseComponent } from '../../debug/BaseComponent.js';

// Type definitions
interface ValidationRule {
    required: string[];
    optional?: string[];
    validators: Record<string, (value: any) => ValidationResult>;
}

interface ValidationResult {
    valid: boolean;
    message?: string;
}

interface CategoryStats {
    passed: number;
    failed: number;
    issues: string[];
}

interface ValidationCategories {
    critical: CategoryStats;
    important: CategoryStats;
    optional: CategoryStats;
}

interface BaseValidation {
    valid: boolean;
    issues: string[];
    warnings: string[];
    categories: ValidationCategories;
}

interface ConfigurationValidation extends BaseValidation {
    bubbleTypesCount: number;
    sourceFiles: string[];
    validatedAt: number;
}

interface BubbleType {
    health?: number;
    score?: number;
    size?: number;
    maxAge?: number;
    effects?: Record<string, number>;
}

interface GameBalance {
    baseScores?: Record<string, number>;
    bubbles?: Record<string, any>;
}

interface Metadata {
    extractedAt?: number;
    sourceFiles?: string[];
    generatorVersion?: string;
}

interface Expectations {
    metadata?: Metadata;
    bubbleTypes?: Record<string, BubbleType>;
    gameBalance?: GameBalance;
}

interface ValidationHistoryEntry {
    timestamp: number;
    validation: ConfigurationValidation;
}

interface ValidationStatistics {
    totalValidations: number;
    successfulValidations: number;
    successRate: number;
    recentValidations: number;
    averageIssuesPerValidation: number;
}

interface MainController {
    [key: string]: any;
}
/**
 * ConfigurationValidator - 設定検証・整合性チェックコンポーネント
 */
export class ConfigurationValidator extends BaseComponent {
    private validationRules: Map<string, ValidationRule>;
    private validationHistory: ValidationHistoryEntry[];
    private validationCache: Map<string, any>;
    private validationCategories: {
        critical: string[];
        important: string[];
        optional: string[];
    };

    constructor(mainController: MainController) {
        super(mainController, 'ConfigurationValidator');
        this.validationRules = new Map();
        this.validationHistory = [];
        this.validationCache = new Map();
    }
    async _doInitialize(): Promise<void> {
        this.setupValidationRules();
        this.setupValidationCategories();
    }

    /**
     * 検証ルールを設定
     */
    private setupValidationRules(): void {
        this.validationRules.set('bubbleType', {
            required: ['health', 'score', 'size', 'maxAge'],
            optional: ['effects'],
            validators: {
                health: (value) => this.validatePositiveNumber(value, 'health'),
                score: (value) => this.validateNonNegativeNumber(value, 'score'),
                size: (value) => this.validatePositiveNumber(value, 'size'),
                maxAge: (value) => this.validatePositiveNumber(value, 'maxAge'),
                effects: (value) => this.validateEffects(value)
            }
        });

        // GameBalance検証ルール
        this.validationRules.set('gameBalance', {
            required: ['baseScores', 'bubbles'],
            validators: {
                baseScores: (value) => this.validateBaseScores(value),
                bubbles: (value) => this.validateBubblesConfig(value)
            }
        });

        // メタデータ検証ルール
        this.validationRules.set('metadata', {
            required: ['extractedAt', 'sourceFiles', 'generatorVersion'],
            validators: {
                extractedAt: (value) => this.validateTimestamp(value),
                sourceFiles: (value) => this.validateSourceFiles(value),
                generatorVersion: (value) => this.validateVersion(value)
            }
        });
    }

    /**
     * 検証カテゴリを設定
     */
    private setupValidationCategories(): void {
        this.validationCategories = {
            critical: ['health', 'size', 'baseScores'],
            important: ['score', 'maxAge', 'sourceFiles'],
            optional: ['effects', 'generatorVersion']
        };
    }

    /**
     * 設定同期を検証
     * @param expectations - 期待値
     * @returns 検証結果
     */
    validateConfigurationSync(expectations: Expectations): ConfigurationValidation {
        try {
            const validation: ConfigurationValidation = {
                valid: true,
                issues: [],
                warnings: [],
                bubbleTypesCount: 0,
                sourceFiles: [],
                validatedAt: Date.now(),
                categories: {
                    critical: { passed: 0, failed: 0, issues: [] },
                    important: { passed: 0, failed: 0, issues: [] },
                    optional: { passed: 0, failed: 0, issues: [] }
                }
            };

            if (!expectations || typeof expectations !== 'object') {
                validation.valid = false;
                validation.issues.push('Invalid expectations object');
                return validation;
            }

            // メタデータ検証
            if (expectations.metadata) {
                const metadataValidation = this.validateMetadata(expectations.metadata);
                this.mergeValidationResults(validation, metadataValidation);
                validation.sourceFiles = expectations.metadata.sourceFiles || [];
            } else {
                validation.warnings.push('Missing metadata');
            }

            // バブルタイプ検証
            if (expectations.bubbleTypes) {
                const bubbleTypesValidation = this.validateBubbleTypes(expectations.bubbleTypes);
                this.mergeValidationResults(validation, bubbleTypesValidation);
                validation.bubbleTypesCount = Object.keys(expectations.bubbleTypes).length;
            } else {
                validation.warnings.push('Missing bubble types configuration');
            }

            // GameBalance検証
            if (expectations.gameBalance) {
                const gameBalanceValidation = this.validateGameBalance(expectations.gameBalance);
                this.mergeValidationResults(validation, gameBalanceValidation);
            } else {
                validation.warnings.push('Missing game balance configuration');
            }

            // 整合性チェック
            const consistencyValidation = this.validateConsistency(expectations);
            this.mergeValidationResults(validation, consistencyValidation);

            // 検証履歴に追加
            this.addValidationHistory(validation);

            return validation;

        } catch (error) {
            this._handleError('configuration sync validation', error);
            return {
                valid: false,
                issues: [`Validation error: ${(error as Error).message}`],
                warnings: [],
                bubbleTypesCount: 0,
                sourceFiles: [],
                validatedAt: Date.now(),
                categories: {
                    critical: { passed: 0, failed: 0, issues: [] },
                    important: { passed: 0, failed: 0, issues: [] },
                    optional: { passed: 0, failed: 0, issues: [] }
                }
            };
        }
    }
    /**
     * バブルタイプを検証
     * @param bubbleTypes - バブルタイプ設定
     * @returns 検証結果
     */
    private validateBubbleTypes(bubbleTypes: Record<string, BubbleType>): BaseValidation {
        const validation: BaseValidation = {
            valid: true,
            issues: [],
            warnings: [],
            categories: {
                critical: { passed: 0, failed: 0, issues: [] },
                important: { passed: 0, failed: 0, issues: [] },
                optional: { passed: 0, failed: 0, issues: [] }
            }
        };

        for (const [bubbleType, config] of Object.entries(bubbleTypes)) {
            const bubbleValidation = this.validateSingleBubbleType(bubbleType, config);
            this.mergeValidationResults(validation, bubbleValidation);
        }
        return validation;
    }

    /**
     * 単一バブルタイプを検証
     * @param bubbleType - バブルタイプ名
     * @param config - バブル設定
     * @returns 検証結果
     */
    private validateSingleBubbleType(bubbleType: string, config: BubbleType): BaseValidation {
        const validation: BaseValidation = {
            valid: true,
            issues: [],
            warnings: [],
            categories: {
                critical: { passed: 0, failed: 0, issues: [] },
                important: { passed: 0, failed: 0, issues: [] },
                optional: { passed: 0, failed: 0, issues: [] }
            }
        };

        if (!config || typeof config !== 'object') {
            validation.valid = false;
            validation.issues.push(`${bubbleType}: Invalid configuration object`);
            validation.categories.critical.failed++;
            validation.categories.critical.issues.push(`${bubbleType}: Invalid configuration`);
            return validation;
        }

        const rules = this.validationRules.get('bubbleType');
        if (!rules) return validation;
        
        // 必須プロパティの検証
        for (const prop of rules.required) {
            if ((config as any)[prop] === undefined || (config as any)[prop] === null) {
                const category = this.getCategoryForProperty(prop);
                const message = `${bubbleType}: Missing required property '${prop}'`;

                if (category === 'critical') {
                    validation.valid = false;
                    validation.issues.push(message);
                    validation.categories.critical.failed++;
                    validation.categories.critical.issues.push(message);
                } else {
                    validation.warnings.push(message);
                    validation.categories[category as keyof ValidationCategories].failed++;
                    validation.categories[category as keyof ValidationCategories].issues.push(message);
                }
            } else {
                // プロパティ値の検証
                const validator = rules.validators[prop];
                if (validator) {
                    const propValidation = validator((config as any)[prop]);
                    if (!propValidation.valid) {
                        const category = this.getCategoryForProperty(prop);
                        const message = `${bubbleType}: ${propValidation.message}`;

                        if (category === 'critical') {
                            validation.valid = false;
                            validation.issues.push(message);
                            validation.categories.critical.failed++;
                            validation.categories.critical.issues.push(message);
                        } else {
                            validation.warnings.push(message);
                            validation.categories[category as keyof ValidationCategories].failed++;
                            validation.categories[category as keyof ValidationCategories].issues.push(message);
                        }
                    } else {
                        const category = this.getCategoryForProperty(prop);
                        validation.categories[category as keyof ValidationCategories].passed++;
                    }
                }
            }
        }

        // オプションプロパティの検証
        for (const prop of rules.optional || []) {
            if ((config as any)[prop] !== undefined && (config as any)[prop] !== null) {
                const validator = rules.validators[prop];
                if (validator) {
                    const propValidation = validator((config as any)[prop]);
                    if (!propValidation.valid) {
                        validation.warnings.push(`${bubbleType}: ${propValidation.message}`);
                        validation.categories.optional.failed++;
                        validation.categories.optional.issues.push(`${bubbleType}: ${propValidation.message}`);
                    } else {
                        validation.categories.optional.passed++;
                    }
                }
            }
        }
        return validation;
    }

    /**
     * GameBalance設定を検証
     * @param gameBalance - GameBalance設定
     * @returns 検証結果
     */
    private validateGameBalance(gameBalance: GameBalance): BaseValidation {
        const validation: BaseValidation = {
            valid: true,
            issues: [],
            warnings: [],
            categories: {
                critical: { passed: 0, failed: 0, issues: [] },
                important: { passed: 0, failed: 0, issues: [] },
                optional: { passed: 0, failed: 0, issues: [] }
            }
        };

        const rules = this.validationRules.get('gameBalance');
        if (!rules) return validation;

        for (const prop of rules.required) {
            if (!(gameBalance as any)[prop]) {
                validation.valid = false;
                validation.issues.push(`GameBalance: Missing required property '${prop}'`);
                validation.categories.critical.failed++;
            } else {
                const validator = rules.validators[prop];
                if (validator) {
                    const propValidation = validator((gameBalance as any)[prop]);
                    if (!propValidation.valid) {
                        validation.valid = false;
                        validation.issues.push(`GameBalance: ${propValidation.message}`);
                        validation.categories.critical.failed++;
                    } else {
                        validation.categories.critical.passed++;
                    }
                }
            }
        }
        return validation;
    }

    /**
     * メタデータを検証
     * @param metadata - メタデータ
     * @returns 検証結果
     */
    private validateMetadata(metadata: Metadata): BaseValidation {
        const validation: BaseValidation = {
            valid: true,
            issues: [],
            warnings: [],
            categories: {
                critical: { passed: 0, failed: 0, issues: [] },
                important: { passed: 0, failed: 0, issues: [] },
                optional: { passed: 0, failed: 0, issues: [] }
            }
        };

        const rules = this.validationRules.get('metadata');
        if (!rules) return validation;

        for (const prop of rules.required) {
            if (!(metadata as any)[prop]) {
                validation.warnings.push(`Metadata: Missing property '${prop}'`);
                validation.categories.important.failed++;
            } else {
                const validator = rules.validators[prop];
                if (validator) {
                    const propValidation = validator((metadata as any)[prop]);
                    if (!propValidation.valid) {
                        validation.warnings.push(`Metadata: ${propValidation.message}`);
                        validation.categories.important.failed++;
                    } else {
                        validation.categories.important.passed++;
                    }
                }
            }
        }
        return validation;
    }

    /**
     * 整合性を検証
     * @param expectations - 期待値
     * @returns 検証結果
     */
    private validateConsistency(expectations: Expectations): BaseValidation {
        const validation: BaseValidation = {
            valid: true,
            issues: [],
            warnings: [],
            categories: {
                critical: { passed: 0, failed: 0, issues: [] },
                important: { passed: 0, failed: 0, issues: [] },
                optional: { passed: 0, failed: 0, issues: [] }
            }
        };

        // バブルタイプとGameBalanceの整合性チェック
        if (expectations.bubbleTypes && expectations.gameBalance) {
            const bubbleTypeNames = Object.keys(expectations.bubbleTypes);
            const gameBalanceBubbles = Object.keys(expectations.gameBalance.bubbles || {});
            const baseScoreBubbles = Object.keys(expectations.gameBalance.baseScores || {});
            
            // 不一致のチェック
            const missingInGameBalance = bubbleTypeNames.filter(name => !gameBalanceBubbles.includes(name));
            const missingInBaseScores = bubbleTypeNames.filter(name => !baseScoreBubbles.includes(name));

            if (missingInGameBalance.length > 0) {
                validation.warnings.push(`Bubble types missing in GameBalance.bubbles: ${missingInGameBalance.join(', ')}`);
                validation.categories.important.failed++;
            }

            if (missingInBaseScores.length > 0) {
                validation.warnings.push(`Bubble types missing in GameBalance.baseScores: ${missingInBaseScores.join(', ')}`);
                validation.categories.important.failed++;
            }

            if (missingInGameBalance.length === 0 && missingInBaseScores.length === 0) {
                validation.categories.important.passed++;
            }
        }

        return validation;
    }

    // === バリデーター関数 ===

    /**
     * 正の数値を検証
     * @param value - 値
     * @param propName - プロパティ名
     * @returns 検証結果
     */
    private validatePositiveNumber(value: any, propName: string): ValidationResult {
        if (typeof value !== 'number') {
            return { valid: false, message: `${propName} must be a number, got ${typeof value}` };
        }
        if (value <= 0) {
            return { valid: false, message: `${propName} must be positive, got ${value}` };
        }
        return { valid: true };
    }

    /**
     * 非負の数値を検証
     * @param value - 値
     * @param propName - プロパティ名
     * @returns 検証結果
     */
    private validateNonNegativeNumber(value: any, propName: string): ValidationResult {
        if (typeof value !== 'number') {
            return { valid: false, message: `${propName} must be a number, got ${typeof value}` };
        }
        if (value < 0) {
            return { valid: false, message: `${propName} must be non-negative, got ${value}` };
        }
        return { valid: true };
    }

    /**
     * エフェクトを検証
     * @param value - エフェクト値
     * @returns 検証結果
     */
    private validateEffects(value: any): ValidationResult {
        if (typeof value !== 'object' || value === null) {
            return { valid: false, message: 'effects must be an object' };
        }
        
        // エフェクトの各プロパティを検証
        for (const [key, val] of Object.entries(value)) {
            if (typeof val !== 'number') {
                return { valid: false, message: `effects.${key} must be a number` };
            }
        }
        
        return { valid: true };
    }

    /**
     * ベーススコアを検証
     * @param value - ベーススコア値
     * @returns 検証結果
     */
    private validateBaseScores(value: any): ValidationResult {
        if (typeof value !== 'object' || value === null) {
            return { valid: false, message: 'baseScores must be an object' };
        }
        
        for (const [bubbleType, score] of Object.entries(value)) {
            const scoreValidation = this.validateNonNegativeNumber(score, `baseScores.${bubbleType}`);
            if (!scoreValidation.valid) {
                return scoreValidation;
            }
        }
        
        return { valid: true };
    }

    /**
     * バブル設定を検証
     * @param value - バブル設定値
     * @returns 検証結果
     */
    private validateBubblesConfig(value: any): ValidationResult {
        if (typeof value !== 'object' || value === null) {
            return { valid: false, message: 'bubbles must be an object' };
        }

        for (const [bubbleType, config] of Object.entries(value)) {
            if (typeof config !== 'object' || config === null) {
                return { valid: false, message: `bubbles.${bubbleType} must be an object` };
            }
        }
        
        return { valid: true };
    }

    /**
     * タイムスタンプを検証
     * @param value - タイムスタンプ値
     * @returns 検証結果
     */
    private validateTimestamp(value: any): ValidationResult {
        if (typeof value !== 'number') {
            return { valid: false, message: 'timestamp must be a number' };
        }
        
        const now = Date.now();
        const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);

        if (value < oneYearAgo || value > now) {
            return { valid: false, message: 'timestamp appears to be invalid' };
        }
        
        return { valid: true };
    }

    /**
     * ソースファイルを検証
     * @param value - ソースファイル値
     * @returns 検証結果
     */
    private validateSourceFiles(value: any): ValidationResult {
        if (!Array.isArray(value)) {
            return { valid: false, message: 'sourceFiles must be an array' };
        }

        if (value.length === 0) {
            return { valid: false, message: 'sourceFiles cannot be empty' };
        }

        for (const file of value) {
            if (typeof file !== 'string') {
                return { valid: false, message: 'all sourceFiles must be strings' };
            }
        }
        
        return { valid: true };
    }

    /**
     * バージョンを検証
     * @param value - バージョン値
     * @returns 検証結果
     */
    private validateVersion(value: any): ValidationResult {
        if (typeof value !== 'string') {
            return { valid: false, message: 'version must be a string' };
        }
        
        // セマンティックバージョニングの簡単なチェック
        const semverRegex = /^\d+\.\d+\.\d+/;
        if (!semverRegex.test(value)) {
            return { valid: false, message: 'version should follow semantic versioning (e.g., 1.0.0)' };
        }
        
        return { valid: true };
    }
    // === ユーティリティメソッド ===

    /**
     * プロパティのカテゴリを取得
     * @param property - プロパティ名
     * @returns カテゴリ名
     */
    private getCategoryForProperty(property: string): string {
        for (const [category, properties] of Object.entries(this.validationCategories)) {
            if (properties.includes(property)) {
                return category;
            }
        }
        return 'optional';
    }

    /**
     * 検証結果をマージ
     * @param target - マージ先
     * @param source - マージ元
     */
    private mergeValidationResults(target: BaseValidation, source: BaseValidation): void {
        if (!source.valid) {
            target.valid = false;
        }
        target.issues.push(...source.issues);
        target.warnings.push(...source.warnings);
        
        if (source.categories) {
            for (const [category, stats] of Object.entries(source.categories)) {
                if (target.categories[category as keyof ValidationCategories]) {
                    target.categories[category as keyof ValidationCategories].passed += stats.passed;
                    target.categories[category as keyof ValidationCategories].failed += stats.failed;
                    target.categories[category as keyof ValidationCategories].issues.push(...stats.issues);
                }
            }
        }
    }

    /**
     * 検証履歴に追加
     * @param validation - 検証結果
     */
    private addValidationHistory(validation: ConfigurationValidation): void {
        this.validationHistory.push({
            timestamp: Date.now(),
            validation: { ...validation }
        });
        
        // 履歴サイズを制限（最大50件）
        if (this.validationHistory.length > 50) {
            this.validationHistory = this.validationHistory.slice(-50);
        }
    }

    /**
     * 検証統計を取得
     * @returns 検証統計
     */
    getValidationStatistics(): ValidationStatistics {
        const recent = this.validationHistory.slice(-10);
        const totalValidations = this.validationHistory.length;
        const successfulValidations = this.validationHistory.filter(v => v.validation.valid).length;
        
        return {
            totalValidations,
            successfulValidations,
            successRate: totalValidations > 0 ? (successfulValidations / totalValidations) * 100 : 0,
            recentValidations: recent.length,
            averageIssuesPerValidation: totalValidations > 0 
                ? this.validationHistory.reduce((sum, v) => sum + v.validation.issues.length, 0) / totalValidations 
                : 0
        };
    }

    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.validationHistory = [];
        this.validationCache.clear();
        super.cleanup();
    }
}'