import { getErrorHandler } from '../../../utils/ErrorHandler.js';
import { getTranslationKeyManager } from './TranslationKeyManager.js';
import { getProgressTracker } from './ProgressTracker.js';
import { getQualityChecker } from '../quality/QualityChecker.js';

// インターフェース定義
export interface CommandDefinition {
    name: string;
    description: string;
    execute: (options: any) => Promise<any>;
    options?: CommandOptions;
    registeredAt?: string;
    [key: string]: any;
}

export interface CommandOptions {
    [key: string]: {
        type: string;
        default?: any;
        description?: string;
    };
}

export interface CICDConfig {
    failOnErrors: boolean;
    failOnWarnings: boolean;
    maxErrorCount: number;
    maxWarningCount: number;
    requiredCompletionRate: number;
    requiredQualityScore: number;
}

export interface ValidationResult {
    command: string;
    result: any;
    executedAt: string;
    executionTime: number;
    options: any;
}

export interface CommandResult {
    success: boolean;
    command: string;
    result?: any;
    error?: string;
    executionTime?: number;
    executedAt?: string;
}

export interface UntranslatedCheckResult {
    summary: {
        totalLanguages: number;
        totalUntranslatedItems: number;
        languageResults: {
            [language: string]: {
                untranslated: number;
                empty: number;
                incomplete: number;
                total: number;
            };
        };
    };
    details: {
        [language: string]: {
            language: string;
            untranslatedItems: any[];
            emptyItems: any[];
            incompleteItems: any[];
        };
    };
    passed: boolean;
    executedAt: string;
}

export interface ConsistencyCheckResult {
    baseLanguage: string;
    consistency: {
        missingKeys: { [language: string]: string[] };
        extraKeys: { [language: string]: string[] };
        duplicateKeys: any[];
        formatMismatches: { [language: string]: any[] };
    };
    summary: {
        totalIssues: number;
        languagesChecked: number;
    };
    passed: boolean;
    executedAt: string;
}

export interface QualityCheckResult {
    qualityResults: {
        [language: string]: {
            qualityScore: number;
            qualityGrade: string;
            errorCount: number;
            warningCount: number;
            passedCount: number;
        };
    };
    passed: boolean;
    threshold: number;
    summary: {
        averageScore: number;
        passedLanguages: number;
        failedLanguages: number;
        totalIssues: number;
    };
    executedAt: string;
}

export interface ProgressCheckResult {
    progressResults: {
        [language: string]: {
            completionRate: number;
            qualityScore: number;
            translationRate: number;
            totalKeys: number;
            completionPassed: boolean;
            qualityPassed: boolean;
            passed: boolean;
        };
    };
    requirements: {
        minCompletion: number;
        minQuality: number;
    };
    summary: {
        passedLanguages: number;
        failedLanguages: number;
        averageCompletion: number;
        averageQuality: number;
    };
    passed: boolean;
    executedAt: string;
}

export interface KeyUsageCheckResult {
    keyUsage: {
        unusedKeys: any[];
        duplicateKeys: any[];
        totalRegisteredKeys: number;
        totalUsedKeys: number;
    };
    summary: {
        unusedCount: number;
        duplicateCount: number;
        usageRate: number;
    };
    passed: boolean;
    executedAt: string;
}

export interface ValidateAllResult {
    commands: {
        [commandName: string]: CommandResult;
    };
    summary: {
        totalCommands: number;
        passedCommands: number;
        failedCommands: number;
        totalIssues: number;
    };
    overallPassed: boolean;
    executedAt: string;
    reportGenerated?: boolean;
}

export interface ReportData {
    generatedAt: string;
    summary: {
        totalValidations: number;
        passedValidations: number;
        failedValidations: number;
    };
    results: {
        [commandName: string]: {
            command: string;
            executedAt: string;
            executionTime: number;
            passed: boolean;
            summary: any;
            details?: any;
        };
    };
}

export interface ReportResult {
    format: string;
    content: string;
    size: number;
    outputPath: string | null;
    generatedAt: string;
}

export interface FormatIssue {
    key: string;
    issue: string;
    baseParams: string[];
    targetParams: string[];
}

export interface CommandInfo {
    name: string;
    displayName: string;
    description: string;
    options?: CommandOptions;
}

export interface CommandStats {
    registeredCommands: number;
    executedCommands: number;
    cicdConfig: CICDConfig;
    availableCommands: string[];
}

/**
 * 翻訳検証コマンドクラス - 翻訳整合性チェックとCI/CD統合コマンド
 */
export class ValidationCommands {
    private keyManager: any;
    private progressTracker: any;
    private qualityChecker: any;
    private commands: Map<string, CommandDefinition>;
    private lastValidationResults: Map<string, ValidationResult>;
    private cicdConfig: CICDConfig;

    constructor() {
        this.keyManager = getTranslationKeyManager();
        this.progressTracker = getProgressTracker();
        this.qualityChecker = getQualityChecker();
        
        // コマンド登録
        this.commands = new Map();
        this.registerBuiltinCommands();
        
        // 検証結果
        this.lastValidationResults = new Map();
        
        // CI/CD設定
        this.cicdConfig = {
            failOnErrors: true,
            failOnWarnings: false,
            maxErrorCount: 10,
            maxWarningCount: 50,
            requiredCompletionRate: 80,
            requiredQualityScore: 70
        };
        
        console.log('ValidationCommands initialized');
    }
    
    /**
     * 組み込みコマンドを登録
     */
    private registerBuiltinCommands(): void {
        // 未翻訳項目検出コマンド
        this.registerCommand('check-untranslated', {
            name: '未翻訳項目検出',
            description: '未翻訳や空の翻訳項目を検出します',
            execute: this.checkUntranslatedItems.bind(this),
            options: {
                languages: { type: 'array', description: 'チェック対象言語' },
                categories: { type: 'array', description: 'チェック対象カテゴリ' },
                outputFormat: { type: 'string', default: 'detailed', description: '出力形式 (detailed|summary|csv)' }
            }
        });
        
        // 翻訳整合性チェックコマンド
        this.registerCommand('check-consistency', {
            name: '翻訳整合性チェック',
            description: '翻訳データの整合性をチェックします',
            execute: this.checkTranslationConsistency.bind(this),
            options: {
                baseLanguage: { type: 'string', default: 'ja', description: '基準言語' },
                targetLanguages: { type: 'array', description: 'チェック対象言語' },
                strict: { type: 'boolean', default: false, description: '厳密モード' }
            }
        });
        
        // 翻訳品質検証コマンド
        this.registerCommand('check-quality', {
            name: '翻訳品質検証',
            description: '翻訳品質を包括的に検証します',
            execute: this.checkTranslationQuality.bind(this),
            options: {
                languages: { type: 'array', description: 'チェック対象言語' },
                rules: { type: 'array', description: '適用する検証ルール' },
                threshold: { type: 'number', default: 70, description: '品質閾値' }
            }
        });
        
        // 進捗検証コマンド
        this.registerCommand('check-progress', {
            name: '進捗検証',
            description: '翻訳進捗の要件を検証します',
            execute: this.checkTranslationProgress.bind(this),
            options: {
                languages: { type: 'array', description: 'チェック対象言語' },
                minCompletion: { type: 'number', default: 80, description: '最小完成率' },
                minQuality: { type: 'number', default: 70, description: '最小品質スコア' }
            }
        });
        
        // キー使用状況検証コマンド
        this.registerCommand('check-key-usage', {
            name: 'キー使用状況検証',
            description: '翻訳キーの使用状況を検証します',
            execute: this.checkKeyUsage.bind(this),
            options: {
                findUnused: { type: 'boolean', default: true, description: '未使用キーを検出' },
                findDuplicates: { type: 'boolean', default: true, description: '重複キーを検出' },
                minAge: { type: 'number', default: 30, description: '未使用判定の最小日数' }
            }
        });
        
        // 統合検証コマンド
        this.registerCommand('validate-all', {
            name: '統合検証',
            description: 'すべての検証を実行します',
            execute: this.validateAll.bind(this),
            options: {
                languages: { type: 'array', description: 'チェック対象言語' },
                exitOnError: { type: 'boolean', default: true, description: 'エラー時に終了' },
                generateReport: { type: 'boolean', default: true, description: 'レポート生成' }
            }
        });
        
        // レポート生成コマンド
        this.registerCommand('generate-report', {
            name: 'レポート生成',
            description: '検証結果のレポートを生成します',
            execute: this.generateValidationReport.bind(this),
            options: {
                format: { type: 'string', default: 'html', description: 'レポート形式 (html|json|csv)' },
                output: { type: 'string', description: '出力ファイルパス' },
                includeDetails: { type: 'boolean', default: true, description: '詳細情報を含める' }
            }
        });
    }
    
    /**
     * コマンドを登録
     */
    registerCommand(name: string, commandDefinition: CommandDefinition): void {
        this.commands.set(name, {
            name: commandDefinition.name,
            description: commandDefinition.description,
            execute: commandDefinition.execute,
            options: commandDefinition.options || {},
            registeredAt: new Date().toISOString(),
            ...commandDefinition
        });
    }
    
    /**
     * コマンドを実行
     */
    async executeCommand(commandName: string, options: any = {}): Promise<CommandResult> {
        try {
            const command = this.commands.get(commandName);
            if (!command) {
                throw new Error(`Unknown command: ${commandName}`);
            }
            
            console.log(`Executing command: ${command.name}`);
            const startTime = Date.now();
            
            // オプションを検証
            const validatedOptions = this.validateCommandOptions(command, options);
            
            // コマンドを実行
            const result = await command.execute(validatedOptions);
            const executionTime = Date.now() - startTime;
            
            // 実行結果を保存
            this.lastValidationResults.set(commandName, {
                command: commandName,
                result: result,
                executedAt: new Date().toISOString(),
                executionTime: executionTime,
                options: validatedOptions
            });
            
            console.log(`Command completed: ${command.name} (${executionTime}ms)`);
            
            return {
                success: true,
                command: commandName,
                result: result,
                executionTime: executionTime,
                executedAt: new Date().toISOString()
            };
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'VALIDATION_COMMANDS_ERROR', {
                command: commandName,
                options: options
            });
            
            return {
                success: false,
                command: commandName,
                error: error instanceof Error ? error.message : String(error),
                executedAt: new Date().toISOString()
            };
        }
    }
    
    /**
     * 未翻訳項目検出
     */
    async checkUntranslatedItems(options: any): Promise<UntranslatedCheckResult> {
        const { languages = [], categories = [], outputFormat = 'detailed' } = options;
        
        const results: UntranslatedCheckResult = {
            summary: {
                totalLanguages: 0,
                totalUntranslatedItems: 0,
                languageResults: {}
            },
            details: {},
            passed: false,
            executedAt: new Date().toISOString()
        };
        
        const targetLanguages = languages.length > 0 ? languages : Object.keys(this.progressTracker.getAllLanguageProgress());
        
        for (const language of targetLanguages) {
            const languageResults = {
                language: language,
                untranslatedItems: [] as any[],
                emptyItems: [] as any[],
                incompleteItems: [] as any[]
            };
            
            // 進捗追跡から未完成項目を取得
            const incompleteItems = this.progressTracker.getIncompleteItems(language, {
                status: ['empty', 'translated'], // 空または翻訳済みだが品質が低い
                category: categories.length > 0 ? categories[0] : null
            });
            
            incompleteItems.forEach((item: any) => {
                if (item.status === 'empty' || !item.value || item.value.trim() === '') {
                    if (item.value === '') {
                        languageResults.emptyItems.push(item);
                    } else {
                        languageResults.untranslatedItems.push(item);
                    }
                } else {
                    languageResults.incompleteItems.push(item);
                }
            });
            
            const totalIssues = languageResults.untranslatedItems.length +
                              languageResults.emptyItems.length +
                              languageResults.incompleteItems.length;
            
            results.summary.languageResults[language] = {
                untranslated: languageResults.untranslatedItems.length,
                empty: languageResults.emptyItems.length,
                incomplete: languageResults.incompleteItems.length,
                total: totalIssues
            };
            
            results.summary.totalUntranslatedItems += totalIssues;
            results.details[language] = languageResults;
        }
        
        results.summary.totalLanguages = targetLanguages.length;
        results.passed = results.summary.totalUntranslatedItems === 0;
        
        return results;
    }
    
    /**
     * 翻訳整合性チェック
     */
    async checkTranslationConsistency(options: any): Promise<ConsistencyCheckResult> {
        const { baseLanguage = 'ja', targetLanguages = [], strict = false } = options;
        
        const results: ConsistencyCheckResult = {
            baseLanguage: baseLanguage,
            consistency: {
                missingKeys: {},
                extraKeys: {},
                duplicateKeys: [],
                formatMismatches: {}
            },
            summary: {
                totalIssues: 0,
                languagesChecked: 0
            },
            passed: false,
            executedAt: new Date().toISOString()
        };
        
        // 基準言語のキーを取得
        const baseKeys = await this.keyManager.getKeysByLanguage(baseLanguage);
        const targetLangs = targetLanguages.length > 0 ? targetLanguages : await this.keyManager.getSupportedLanguages();
        
        for (const targetLanguage of targetLangs) {
            if (targetLanguage === baseLanguage) continue;
            
            const targetKeys = await this.keyManager.getKeysByLanguage(targetLanguage);
            
            // 不足キーを検出
            const missingKeys = baseKeys.filter((key: string) => !targetKeys.includes(key));
            if (missingKeys.length > 0) {
                results.consistency.missingKeys[targetLanguage] = missingKeys;
                results.summary.totalIssues += missingKeys.length;
            }
            
            // 余分なキーを検出
            const extraKeys = targetKeys.filter((key: string) => !baseKeys.includes(key));
            if (extraKeys.length > 0) {
                results.consistency.extraKeys[targetLanguage] = extraKeys;
                results.summary.totalIssues += extraKeys.length;
            }
            
            // パラメータ形式の不一致を検出
            if (strict) {
                const formatMismatches = await this.checkFormatConsistency(baseLanguage, targetLanguage, baseKeys);
                if (formatMismatches.length > 0) {
                    results.consistency.formatMismatches[targetLanguage] = formatMismatches;
                    results.summary.totalIssues += formatMismatches.length;
                }
            }
            
            results.summary.languagesChecked++;
        }
        
        // 重複キーを検出
        const duplicateKeys = await this.keyManager.findDuplicateKeys();
        if (duplicateKeys.length > 0) {
            results.consistency.duplicateKeys = duplicateKeys;
            results.summary.totalIssues += duplicateKeys.length;
        }
        
        results.passed = results.summary.totalIssues === 0;
        
        return results;
    }
    
    /**
     * 翻訳品質検証
     */
    async checkTranslationQuality(options: any): Promise<QualityCheckResult> {
        const { languages = [], rules = [], threshold = 70 } = options;
        
        const results: QualityCheckResult = {
            qualityResults: {},
            passed: false,
            threshold: threshold,
            summary: {
                averageScore: 0,
                passedLanguages: 0,
                failedLanguages: 0,
                totalIssues: 0
            },
            executedAt: new Date().toISOString()
        };
        
        const targetLanguages = languages.length > 0 ? languages : await this.keyManager.getSupportedLanguages();
        let totalScore = 0;
        
        for (const language of targetLanguages) {
            const qualityResult = await this.qualityChecker.checkLanguageQuality(language, {
                rules: rules.length > 0 ? rules : undefined
            });
            
            results.qualityResults[language] = {
                qualityScore: qualityResult.score,
                qualityGrade: qualityResult.grade,
                errorCount: qualityResult.errors.length,
                warningCount: qualityResult.warnings.length,
                passedCount: qualityResult.passed.length
            };
            
            totalScore += qualityResult.score;
            results.summary.totalIssues += qualityResult.errors.length + qualityResult.warnings.length;
            
            if (qualityResult.score >= threshold) {
                results.summary.passedLanguages++;
            } else {
                results.summary.failedLanguages++;
            }
        }
        
        results.summary.averageScore = targetLanguages.length > 0 ? totalScore / targetLanguages.length : 0;
        results.passed = results.summary.averageScore >= threshold && results.summary.failedLanguages === 0;
        
        return results;
    }
    
    /**
     * 翻訳進捗検証
     */
    async checkTranslationProgress(options: any): Promise<ProgressCheckResult> {
        const { languages = [], minCompletion = 80, minQuality = 70 } = options;
        
        const results: ProgressCheckResult = {
            progressResults: {},
            requirements: {
                minCompletion: minCompletion,
                minQuality: minQuality
            },
            summary: {
                passedLanguages: 0,
                failedLanguages: 0,
                averageCompletion: 0,
                averageQuality: 0
            },
            passed: false,
            executedAt: new Date().toISOString()
        };
        
        const targetLanguages = languages.length > 0 ? languages : await this.keyManager.getSupportedLanguages();
        let totalCompletion = 0;
        let totalQuality = 0;
        
        for (const language of targetLanguages) {
            const progress = await this.progressTracker.getLanguageProgress(language);
            const qualityResult = await this.qualityChecker.checkLanguageQuality(language);
            
            const completionPassed = progress.completionRate >= minCompletion;
            const qualityPassed = qualityResult.score >= minQuality;
            const passed = completionPassed && qualityPassed;
            
            results.progressResults[language] = {
                completionRate: progress.completionRate,
                qualityScore: qualityResult.score,
                translationRate: progress.translationRate,
                totalKeys: progress.totalKeys,
                completionPassed: completionPassed,
                qualityPassed: qualityPassed,
                passed: passed
            };
            
            totalCompletion += progress.completionRate;
            totalQuality += qualityResult.score;
            
            if (passed) {
                results.summary.passedLanguages++;
            } else {
                results.summary.failedLanguages++;
            }
        }
        
        results.summary.averageCompletion = targetLanguages.length > 0 ? totalCompletion / targetLanguages.length : 0;
        results.summary.averageQuality = targetLanguages.length > 0 ? totalQuality / targetLanguages.length : 0;
        results.passed = results.summary.failedLanguages === 0;
        
        return results;
    }
    
    /**
     * キー使用状況検証
     */
    async checkKeyUsage(options: any): Promise<KeyUsageCheckResult> {
        const { findUnused = true, findDuplicates = true, minAge = 30 } = options;
        
        const results: KeyUsageCheckResult = {
            keyUsage: {
                unusedKeys: [],
                duplicateKeys: [],
                totalRegisteredKeys: 0,
                totalUsedKeys: 0
            },
            summary: {
                unusedCount: 0,
                duplicateCount: 0,
                usageRate: 0
            },
            passed: false,
            executedAt: new Date().toISOString()
        };
        
        // 登録されているすべてのキーを取得
        const allKeys = await this.keyManager.getAllKeys();
        results.keyUsage.totalRegisteredKeys = allKeys.length;
        
        if (findUnused) {
            const unusedKeys = await this.keyManager.findUnusedKeys({
                minAge: minAge
            });
            results.keyUsage.unusedKeys = unusedKeys;
            results.summary.unusedCount = unusedKeys.length;
        }
        
        if (findDuplicates) {
            const duplicateKeys = await this.keyManager.findDuplicateKeys();
            results.keyUsage.duplicateKeys = duplicateKeys;
            results.summary.duplicateCount = duplicateKeys.length;
        }
        
        results.keyUsage.totalUsedKeys = results.keyUsage.totalRegisteredKeys - results.summary.unusedCount;
        results.summary.usageRate = results.keyUsage.totalRegisteredKeys > 0 
            ? (results.keyUsage.totalUsedKeys / results.keyUsage.totalRegisteredKeys) * 100 
            : 0;
        
        results.passed = results.summary.unusedCount === 0 && results.summary.duplicateCount === 0;
        
        return results;
    }
    
    /**
     * すべての検証を実行
     */
    async validateAll(options: any): Promise<ValidateAllResult> {
        const { languages = [], exitOnError = true, generateReport = true } = options;
        
        const results: ValidateAllResult = {
            commands: {},
            summary: {
                totalCommands: 0,
                passedCommands: 0,
                failedCommands: 0,
                totalIssues: 0
            },
            overallPassed: false,
            executedAt: new Date().toISOString()
        };
        
        const validationCommands = [
            'check-untranslated',
            'check-consistency', 
            'check-quality',
            'check-progress',
            'check-key-usage'
        ];
        
        for (const commandName of validationCommands) {
            const commandResult = await this.executeCommand(commandName, {
                languages: languages
            });
            
            results.commands[commandName] = commandResult;
            results.summary.totalCommands++;
            
            if (commandResult.success && commandResult.result?.passed) {
                results.summary.passedCommands++;
            } else {
                results.summary.failedCommands++;
                
                if (exitOnError) {
                    console.error(`Validation failed at command: ${commandName}`);
                    break;
                }
            }
            
            // 問題数を集計
            if (commandResult.result?.summary?.totalIssues) {
                results.summary.totalIssues += commandResult.result.summary.totalIssues;
            }
        }
        
        results.overallPassed = results.summary.failedCommands === 0;
        
        // レポート生成
        if (generateReport) {
            const reportResult = await this.generateValidationReport({
                format: 'html',
                includeDetails: true
            });
            results.reportGenerated = reportResult.success;
        }
        
        return results;
    }
    
    /**
     * 検証レポートを生成
     */
    async generateValidationReport(options: any): Promise<ReportResult> {
        const { format = 'html', output = null, includeDetails = true } = options;
        
        const reportData: ReportData = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalValidations: this.lastValidationResults.size,
                passedValidations: 0,
                failedValidations: 0
            },
            results: {}
        };
        
        // 最新の検証結果を収集
        for (const [commandName, validationResult] of this.lastValidationResults) {
            const passed = validationResult.result?.passed || false;
            
            reportData.results[commandName] = {
                command: commandName,
                executedAt: validationResult.executedAt,
                executionTime: validationResult.executionTime,
                passed: passed,
                summary: validationResult.result?.summary || {},
                details: includeDetails ? validationResult.result?.details : undefined
            };
            
            if (passed) {
                reportData.summary.passedValidations++;
            } else {
                reportData.summary.failedValidations++;
            }
        }
        
        // フォーマットに応じてレポートを生成
        let content = '';
        switch (format) {
            case 'html':
                content = this.generateHTMLReport(reportData);
                break;
            case 'json':
                content = JSON.stringify(reportData, null, 2);
                break;
            case 'csv':
                content = this.generateCSVReport(reportData);
                break;
            default:
                throw new Error(`Unsupported report format: ${format}`);
        }
        
        // ファイルに出力
        if (output) {
            // ファイル出力の実装（実際の実装では fs を使用）
            console.log(`Report saved to: ${output}`);
        }
        
        return {
            format: format,
            content: content,
            size: content.length,
            outputPath: output,
            generatedAt: reportData.generatedAt
        };
    }
    
    /**
     * HTML形式のレポートを生成
     */
    private generateHTMLReport(data: ReportData): string {
        const passed = data.summary.passedValidations;
        const failed = data.summary.failedValidations;
        const total = data.summary.totalValidations;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Translation Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Translation Validation Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated at: ${data.generatedAt}</p>
        <p>Total Validations: ${total}</p>
        <p class="passed">Passed: ${passed}</p>
        <p class="failed">Failed: ${failed}</p>
    </div>
    <h2>Results</h2>
    <table>
        <tr>
            <th>Command</th>
            <th>Status</th>
            <th>Execution Time</th>
            <th>Summary</th>
        </tr>
        ${Object.entries(data.results).map(([cmd, result]) => `
        <tr>
            <td>${cmd}</td>
            <td class="${result.passed ? 'passed' : 'failed'}">${result.passed ? 'PASSED' : 'FAILED'}</td>
            <td>${result.executionTime}ms</td>
            <td>${JSON.stringify(result.summary)}</td>
        </tr>
        `).join('')}
    </table>
</body>
</html>`;
    }
    
    /**
     * CSV形式のレポートを生成
     */
    private generateCSVReport(data: ReportData): string {
        const headers = ['Command', 'Status', 'Execution Time', 'Executed At'];
        const rows = Object.entries(data.results).map(([cmd, result]) => [
            cmd,
            result.passed ? 'PASSED' : 'FAILED',
            `${result.executionTime}ms`,
            result.executedAt
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    /**
     * コマンドオプションを検証
     */
    private validateCommandOptions(command: CommandDefinition, options: any): any {
        const validatedOptions: any = {};
        
        if (!command.options) {
            return options;
        }
        
        for (const [key, optionDef] of Object.entries(command.options)) {
            if (options[key] !== undefined) {
                // 型チェック
                if (optionDef.type === 'array' && !Array.isArray(options[key])) {
                    throw new Error(`Option '${key}' must be an array`);
                }
                if (optionDef.type === 'number' && typeof options[key] !== 'number') {
                    throw new Error(`Option '${key}' must be a number`);
                }
                if (optionDef.type === 'boolean' && typeof options[key] !== 'boolean') {
                    throw new Error(`Option '${key}' must be a boolean`);
                }
                validatedOptions[key] = options[key];
            } else if (optionDef.default !== undefined) {
                validatedOptions[key] = optionDef.default;
            }
        }
        
        return validatedOptions;
    }
    
    /**
     * フォーマット整合性をチェック
     */
    private async checkFormatConsistency(baseLanguage: string, targetLanguage: string, keys: string[]): Promise<FormatIssue[]> {
        const issues: FormatIssue[] = [];
        
        for (const key of keys) {
            const baseValue = await this.keyManager.getTranslation(key, baseLanguage);
            const targetValue = await this.keyManager.getTranslation(key, targetLanguage);
            
            if (!baseValue || !targetValue) continue;
            
            // パラメータの抽出
            const baseParams = this.extractParameters(baseValue);
            const targetParams = this.extractParameters(targetValue);
            
            // パラメータ数が異なる場合
            if (baseParams.length !== targetParams.length) {
                issues.push({
                    key: key,
                    issue: 'Parameter count mismatch',
                    baseParams: baseParams,
                    targetParams: targetParams
                });
                continue;
            }
            
            // パラメータ名が異なる場合
            const sortedBase = [...baseParams].sort();
            const sortedTarget = [...targetParams].sort();
            if (JSON.stringify(sortedBase) !== JSON.stringify(sortedTarget)) {
                issues.push({
                    key: key,
                    issue: 'Parameter name mismatch',
                    baseParams: baseParams,
                    targetParams: targetParams
                });
            }
        }
        
        return issues;
    }
    
    /**
     * 文字列からパラメータを抽出
     */
    private extractParameters(value: string): string[] {
        const paramPattern = /\{([^}]+)\}/g;
        const params: string[] = [];
        let match;
        
        while ((match = paramPattern.exec(value)) !== null) {
            params.push(match[1]);
        }
        
        return params;
    }
    
    /**
     * CI/CD設定を更新
     */
    updateCICDConfig(config: Partial<CICDConfig>): void {
        this.cicdConfig = { ...this.cicdConfig, ...config };
    }
    
    /**
     * CI/CD用の終了コードを取得
     */
    getCICDExitCode(): number {
        let hasErrors = false;
        let hasWarnings = false;
        let errorCount = 0;
        let warningCount = 0;
        
        for (const [commandName, result] of this.lastValidationResults) {
            if (!result.result?.passed) {
                hasErrors = true;
                
                if (result.result?.summary?.errorCount) {
                    errorCount += result.result.summary.errorCount;
                }
                if (result.result?.summary?.warningCount) {
                    warningCount += result.result.summary.warningCount;
                }
            }
        }
        
        // CI/CD設定に基づいて終了コードを決定
        if (hasErrors && this.cicdConfig.failOnErrors) {
            return 1;
        }
        if (hasWarnings && this.cicdConfig.failOnWarnings) {
            return 1;
        }
        if (errorCount > this.cicdConfig.maxErrorCount) {
            return 1;
        }
        if (warningCount > this.cicdConfig.maxWarningCount) {
            return 1;
        }
        
        return 0;
    }
    
    /**
     * コマンド一覧を取得
     */
    getAvailableCommands(): CommandInfo[] {
        const commandList: CommandInfo[] = [];
        
        for (const [name, command] of this.commands) {
            commandList.push({
                name: name,
                displayName: command.name,
                description: command.description,
                options: command.options
            });
        }
        
        return commandList;
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): CommandStats {
        return {
            registeredCommands: this.commands.size,
            executedCommands: this.lastValidationResults.size,
            cicdConfig: this.cicdConfig,
            availableCommands: Array.from(this.commands.keys())
        };
    }
    
    /**
     * 検証結果をクリア
     */
    clearValidationResults(): void {
        this.lastValidationResults.clear();
    }
}

// シングルトンインスタンス
let validationCommandsInstance: ValidationCommands | null = null;

/**
 * ValidationCommandsのシングルトンインスタンスを取得
 */
export function getValidationCommands(): ValidationCommands {
    if (!validationCommandsInstance) {
        validationCommandsInstance = new ValidationCommands();
    }
    return validationCommandsInstance;
}