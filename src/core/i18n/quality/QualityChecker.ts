/**
 * QualityChecker.ts
 * 翻訳品質管理システム
 * 
 * 翻訳データの品質検証、レポート生成、統計情報管理を提供
 */

import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// 型定義
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning';
    enabled: boolean;
    check: (key: string, translation: string, sourceLanguage: string, targetLanguage: string) => Promise<ValidationResult> | ValidationResult;
}

export interface ValidationResult {
    passed: boolean;
    message: string;
    suggestion?: string;
}

export interface QualityThresholds {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
}

export interface QualityStats {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warnings: number;
}

export interface ValidationIssue {
    rule: string;
    name: string;
    message: string;
    suggestion?: string;
    severity: 'error' | 'warning';
}

export interface ItemValidationResult {
    key: string;
    translation: string;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    passed: ValidationIssue[];
}

export interface TranslationValidationResults {
    language: string;
    sourceLanguage: string;
    timestamp: string;
    totalItems: number;
    checkedItems: number;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    passed: ValidationIssue[];
    qualityScore: number;
    qualityGrade: string;
}

export interface QualityReport {
    summary: {
        language: string;
        totalItems: number;
        checkedItems: number;
        qualityScore: number;
        qualityGrade: string;
        errorCount: number;
        warningCount: number;
    };
    details: {
        errors: ValidationIssue[];
        warnings: ValidationIssue[];
        passed: ValidationIssue[];
    };
    recommendations: Recommendation[];
    timestamp: string;
}

export interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    type: string;
    message: string;
    action: string;
}

export interface QualitySettings {
    qualityThresholds?: Partial<QualityThresholds>;
    rules?: Array<{
        id: string;
        enabled?: boolean;
        severity?: 'error' | 'warning';
    }>;
}

export interface CulturalRules {
    inappropriate: string[];
    suggestions: string[];
}

export interface LengthTolerance {
    min: number;
    max: number;
}

/**
 * 翻訳品質管理クラス
 */
export class QualityChecker {
    private validationRules: Map<string, ValidationRule>;
    private qualityThresholds: QualityThresholds;
    private qualityStats: QualityStats;

    constructor() {
        this.validationRules = new Map<string, ValidationRule>();
        this.qualityThresholds = {
            excellent: 90,
            good: 75,
            acceptable: 60,
            poor: 40
        };

        this.qualityStats = {
            totalChecks: 0,
            passedChecks: 0,
            failedChecks: 0,
            warnings: 0
        };

        // デフォルト検証ルールを初期化
        this.initializeDefaultRules();
        console.log('QualityChecker initialized');
    }

    /**
     * デフォルト検証ルールを初期化
     */
    private initializeDefaultRules(): void {
        // パラメータ整合性チェック
        this.addValidationRule('parameterConsistency', {
            name: 'パラメータ整合性チェック',
            description: '翻訳文中のパラメータ（{param}）が原文と一致するかチェック',
            severity: 'error',
            check: this.checkParameterConsistency.bind(this)
        });

        // 翻訳長制限チェック
        this.addValidationRule('lengthValidation', {
            name: '翻訳長制限チェック',
            description: '翻訳文の長さが適切な範囲内かチェック',
            severity: 'warning',
            check: this.checkLengthValidation.bind(this)
        });

        // フォーマット検証
        this.addValidationRule('formatValidation', {
            name: 'フォーマット検証',
            description: 'HTML要素、マークダウン記法等のフォーマットが保持されているかチェック',
            severity: 'error',
            check: this.checkFormatValidation.bind(this)
        });

        // 文化的適切性チェック
        this.addValidationRule('culturalAppropriateness', {
            name: '文化的適切性チェック',
            description: '文化的に不適切な表現や誤解を招く表現がないかチェック',
            severity: 'warning',
            check: this.checkCulturalAppropriateness.bind(this)
        });

        // 空文字・未翻訳チェック
        this.addValidationRule('completenessCheck', {
            name: '翻訳完成度チェック',
            description: '空文字や未翻訳の項目がないかチェック',
            severity: 'error',
            check: this.checkCompleteness.bind(this)
        });

        // 一貫性チェック
        this.addValidationRule('consistencyCheck', {
            name: '翻訳一貫性チェック',
            description: '同じ原文に対する翻訳が一貫しているかチェック',
            severity: 'warning',
            check: this.checkConsistency.bind(this)
        });
    }

    /**
     * 検証ルールを追加
     */
    addValidationRule(id: string, rule: Omit<ValidationRule, 'id' | 'enabled'>): void {
        if (!rule.name || !rule.check || typeof rule.check !== 'function') {
            throw new Error('Invalid validation rule format');
        }

        this.validationRules.set(id, {
            id: id,
            name: rule.name,
            description: rule.description || '',
            severity: rule.severity || 'warning',
            enabled: true,
            check: rule.check
        });

        console.log(`Validation rule added: ${id}`);
    }

    /**
     * 検証ルールを削除
     */
    removeValidationRule(id: string): boolean {
        const removed = this.validationRules.delete(id);
        if (removed) {
            console.log(`Validation rule removed: ${id}`);
        }
        return removed;
    }

    /**
     * 翻訳データを検証
     */
    async validateTranslations(translations: Record<string, any>, sourceLanguage: string = 'ja', targetLanguage: string): Promise<TranslationValidationResults> {
        try {
            const validationResults: TranslationValidationResults = {
                language: targetLanguage,
                sourceLanguage: sourceLanguage,
                timestamp: new Date().toISOString(),
                totalItems: 0,
                checkedItems: 0,
                errors: [],
                warnings: [],
                passed: [],
                qualityScore: 0,
                qualityGrade: 'unknown'
            };

            // 翻訳データを平坦化してチェック
            const flatTranslations = this.flattenTranslations(translations);
            validationResults.totalItems = Object.keys(flatTranslations).length;

            for (const [key, value] of Object.entries(flatTranslations)) {
                const itemResult = await this.validateTranslationItem(key, value, sourceLanguage, targetLanguage);
                validationResults.checkedItems++;

                if (itemResult.errors.length > 0) {
                    validationResults.errors.push(...itemResult.errors);
                }
                if (itemResult.warnings.length > 0) {
                    validationResults.warnings.push(...itemResult.warnings);
                }
                if (itemResult.passed.length > 0) {
                    validationResults.passed.push(...itemResult.passed);
                }
            }

            // 品質スコアを計算
            validationResults.qualityScore = this.calculateQualityScore(validationResults);
            validationResults.qualityGrade = this.getQualityGrade(validationResults.qualityScore);

            // 統計を更新
            this.updateQualityStats(validationResults);

            return validationResults;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'QUALITY_CHECKER_ERROR', {
                operation: 'validateTranslations',
                targetLanguage: targetLanguage
            });
            throw error;
        }
    }

    /**
     * 個別翻訳項目を検証
     */
    async validateTranslationItem(key: string, translation: string, sourceLanguage: string, targetLanguage: string): Promise<ItemValidationResult> {
        const result: ItemValidationResult = {
            key: key,
            translation: translation,
            errors: [],
            warnings: [],
            passed: []
        };

        try {
            // 有効な検証ルールを実行
            for (const [ruleId, rule] of this.validationRules) {
                if (!rule.enabled) continue;

                try {
                    const ruleResult = await rule.check(key, translation, sourceLanguage, targetLanguage);
                    if (ruleResult.passed) {
                        result.passed.push({
                            rule: ruleId,
                            name: rule.name,
                            message: ruleResult.message || `✓ ${rule.name}に合格`,
                            severity: rule.severity
                        });
                    } else {
                        const issue: ValidationIssue = {
                            rule: ruleId,
                            name: rule.name,
                            message: ruleResult.message || `${rule.name}に問題があります`,
                            suggestion: ruleResult.suggestion,
                            severity: rule.severity
                        };

                        if (rule.severity === 'error') {
                            result.errors.push(issue);
                        } else {
                            result.warnings.push(issue);
                        }
                    }
                } catch (ruleError) {
                    console.warn(`Error in validation rule ${ruleId}:`, ruleError);
                    result.warnings.push({
                        rule: ruleId,
                        name: rule.name,
                        message: `検証ルール実行エラー: ${(ruleError as Error).message}`,
                        severity: 'warning'
                    });
                }
            }
        } catch (error) {
            result.errors.push({
                rule: 'system',
                name: 'システムエラー',
                message: `検証中にエラーが発生しました: ${(error as Error).message}`,
                severity: 'error'
            });
        }

        return result;
    }

    /**
     * パラメータ整合性チェック
     */
    private checkParameterConsistency(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        // 基準となる日本語翻訳を取得（実際の実装では翻訳データベースから取得）
        const sourceText = this.getSourceText(key, sourceLanguage);
        if (!sourceText) {
            return {
                passed: false,
                message: '元の翻訳文が見つかりません',
                suggestion: '翻訳キーが正しいか確認してください'
            };
        }

        // パラメータを抽出（{param}, {{param}, %sなど）
        const sourceParams = this.extractParameters(sourceText);
        const translationParams = this.extractParameters(translation);

        // パラメータ数の比較
        if (sourceParams.length !== translationParams.length) {
            return {
                passed: false,
                message: `パラメータ数が一致しません（元: ${sourceParams.length}, 翻訳: ${translationParams.length}）`,
                suggestion: `パラメータ: ${sourceParams.join(', ')} を含めてください`
            };
        }

        // パラメータ名の比較
        const missingParams = sourceParams.filter(param => !translationParams.includes(param));
        if (missingParams.length > 0) {
            return {
                passed: false,
                message: `不足しているパラメータ: ${missingParams.join(', ')}`,
                suggestion: `パラメータ ${missingParams.join(', ')} を翻訳に含めてください`
            };
        }

        return {
            passed: true,
            message: 'パラメータが正しく含まれています'
        };
    }

    /**
     * 翻訳長制限チェック
     */
    private checkLengthValidation(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        const sourceText = this.getSourceText(key, sourceLanguage);
        if (!sourceText) {
            return {
                passed: true,
                message: '元の翻訳文が見つからないためスキップ'
            };
        }

        const sourceLength = sourceText.length;
        const translationLength = translation.length;

        // 言語別の長さ許容率
        const lengthTolerances: Record<string, LengthTolerance> = {
            'en': { min: 0.7, max: 1.5 },     // 英語: 70%-150%
            'zh-CN': { min: 0.5, max: 1.2 },  // 中国語簡体字: 50%-120%
            'zh-TW': { min: 0.5, max: 1.2 },  // 中国語繁体字: 50%-120%
            'ko': { min: 0.8, max: 1.4 }      // 韓国語: 80%-140%
        };

        const tolerance = lengthTolerances[targetLanguage] || { min: 0.6, max: 1.6 };
        const minLength = sourceLength * tolerance.min;
        const maxLength = sourceLength * tolerance.max;

        if (translationLength < minLength) {
            return {
                passed: false,
                message: `翻訳が短すぎます（${translationLength}文字, 最小: ${Math.round(minLength)}文字）`,
                suggestion: '翻訳が完全か確認してください'
            };
        }

        if (translationLength > maxLength) {
            return {
                passed: false,
                message: `翻訳が長すぎます（${translationLength}文字, 最大: ${Math.round(maxLength)}文字）`,
                suggestion: 'より簡潔な表現を検討してください'
            };
        }

        return {
            passed: true,
            message: `適切な長さです（${translationLength}文字）`
        };
    }

    /**
     * フォーマット検証
     */
    private checkFormatValidation(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        const sourceText = this.getSourceText(key, sourceLanguage);
        if (!sourceText) {
            return {
                passed: true,
                message: '元の翻訳文が見つからないためスキップ'
            };
        }

        // HTMLタグの検証
        const sourceHtmlTags = this.extractHtmlTags(sourceText);
        const translationHtmlTags = this.extractHtmlTags(translation);

        if (sourceHtmlTags.length !== translationHtmlTags.length) {
            return {
                passed: false,
                message: 'HTMLタグの数が一致しません',
                suggestion: `必要なタグ: ${sourceHtmlTags.join(', ')}`
            };
        }

        // マークダウン記法の検証
        const sourceMarkdown = this.extractMarkdownElements(sourceText);
        const translationMarkdown = this.extractMarkdownElements(translation);

        const markdownMismatch = sourceMarkdown.filter(md => !translationMarkdown.includes(md));
        if (markdownMismatch.length > 0) {
            return {
                passed: false,
                message: 'マークダウン記法が不足しています',
                suggestion: `必要な記法: ${markdownMismatch.join(', ')}`
            };
        }

        return {
            passed: true,
            message: 'フォーマットが正しく保持されています'
        };
    }

    /**
     * 文化的適切性チェック
     */
    private checkCulturalAppropriateness(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        // 言語別の文化的配慮事項
        const culturalRules: Record<string, CulturalRules> = {
            'en': {
                inappropriate: ['jap', 'oriental'],
                suggestions: ['Use respectful terms', 'Avoid dated terminology']
            },
            'zh-CN': {
                inappropriate: ['台湾国', '中华民国'],
                suggestions: ['Use appropriate political terms', 'Be mindful of regional sensitivities']
            },
            'zh-TW': {
                inappropriate: ['大陆', '内地'],
                suggestions: ['Use neutral geographical terms']
            },
            'ko': {
                inappropriate: ['왜놈', '쪽발이'],
                suggestions: ['Use respectful language', 'Avoid discriminatory terms']
            }
        };

        const rules = culturalRules[targetLanguage];
        if (!rules) {
            return {
                passed: true,
                message: '文化的配慮の検証ルールが定義されていません'
            };
        }

        const lowerTranslation = translation.toLowerCase();
        const foundInappropriate = rules.inappropriate.filter(term =>
            lowerTranslation.includes(term.toLowerCase())
        );

        if (foundInappropriate.length > 0) {
            return {
                passed: false,
                message: `文化的に不適切な表現が含まれています: ${foundInappropriate.join(', ')}`,
                suggestion: rules.suggestions.join('. ')
            };
        }

        return {
            passed: true,
            message: '文化的に適切な表現です'
        };
    }

    /**
     * 翻訳完成度チェック
     */
    private checkCompleteness(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        if (!translation || translation.trim() === '') {
            return {
                passed: false,
                message: '翻訳が空です',
                suggestion: '翻訳を追加してください'
            };
        }

        // 未翻訳マーカーのチェック
        const untranslatedMarkers = ['TODO', 'FIXME', '[未翻訳]', '[TODO]', 'NOT_TRANSLATED'];
        const hasUntranslatedMarker = untranslatedMarkers.some(marker =>
            translation.includes(marker)
        );

        if (hasUntranslatedMarker) {
            return {
                passed: false,
                message: '未翻訳マーカーが含まれています',
                suggestion: '翻訳を完成させてください'
            };
        }

        // 原文がそのまま含まれているかチェック（簡単な判定）
        const sourceText = this.getSourceText(key, sourceLanguage);
        if (sourceText && sourceText.length > 10 && translation.includes(sourceText)) {
            return {
                passed: false,
                message: '原文がそのまま含まれている可能性があります',
                suggestion: '適切に翻訳されているか確認してください'
            };
        }

        return {
            passed: true,
            message: '翻訳が完成しています'
        };
    }

    /**
     * 翻訳一貫性チェック
     */
    private checkConsistency(key: string, translation: string, sourceLanguage: string, targetLanguage: string): ValidationResult {
        // 実際の実装では翻訳メモリやデータベースを使用して一貫性をチェック
        // ここでは基本的な一貫性チェックのみ実装

        // 大文字小文字の一貫性（英語の場合）
        if (targetLanguage === 'en') {
            const sentences = translation.split(/[.!?]+/);
            let inconsistentCapitalization = false;

            sentences.forEach(sentence => {
                const trimmed = sentence.trim();
                if (trimmed.length > 0 && !/^[A-Z]/.test(trimmed)) {
                    inconsistentCapitalization = true;
                }
            });

            if (inconsistentCapitalization) {
                return {
                    passed: false,
                    message: '文の始まりの大文字化が一貫していません',
                    suggestion: '各文の始まりを大文字にしてください'
                };
            }
        }

        // 句読点の一貫性チェック
        const sourceText = this.getSourceText(key, sourceLanguage);
        if (sourceText) {
            const sourcePunctuation = this.extractPunctuation(sourceText);
            const translationPunctuation = this.extractPunctuation(translation);

            // 基本的な句読点の一貫性チェック
            if (sourcePunctuation.endsWith('.') && !translationPunctuation.endsWith('.')) {
                return {
                    passed: false,
                    message: '文末の句読点が一致しません',
                    suggestion: '原文の句読点に合わせてください'
                };
            }
        }

        return {
            passed: true,
            message: '翻訳の一貫性に問題ありません'
        };
    }

    /**
     * 翻訳データを平坦化
     */
    private flattenTranslations(translations: Record<string, any>, prefix: string = ''): Record<string, string> {
        const flattened: Record<string, string> = {};

        for (const [key, value] of Object.entries(translations)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenTranslations(value, fullKey));
            } else if (typeof value === 'string') {
                flattened[fullKey] = value;
            }
        }

        return flattened;
    }

    /**
     * パラメータを抽出
     */
    private extractParameters(text: string): string[] {
        const patterns = [
            /\{([^}]+)\}/g,     // {param}
            /\{\{([^}]+)\}\}/g, // {{param}}
            /%s/g,              // %s
            /%\d+/g             // %1, %2, etc.
        ];

        const params = new Set<string>();

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                params.add(match[0]);
            }
        });

        return Array.from(params);
    }

    /**
     * HTMLタグを抽出
     */
    private extractHtmlTags(text: string): string[] {
        const htmlTagPattern = /<\/?[^>]+>/g;
        const matches = text.match(htmlTagPattern);
        return matches || [];
    }

    /**
     * マークダウン要素を抽出
     */
    private extractMarkdownElements(text: string): string[] {
        const patterns = [
            /\*\*[^*]+\*\*/g,    // **bold**
            /\*[^*]+\*/g,        // *italic*
            /`[^`]+`/g,          // `code`
            /\[[^\]]+\]\([^)]+\)/g, // [link](url)
            /#{1,6}\s/g          // # headers
        ];

        const elements: string[] = [];
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                elements.push(...matches);
            }
        });

        return elements;
    }

    /**
     * 句読点を抽出
     */
    private extractPunctuation(text: string): string {
        return text.replace(/[^.!?。！？]/g, '');
    }

    /**
     * 元の翻訳文を取得（モック実装）
     */
    private getSourceText(key: string, sourceLanguage: string): string | null {
        // 実際の実装では翻訳データベースやファイルから取得
        // ここではモック実装
        const mockTranslations: Record<string, string> = {
            'common.ok': 'OK',
            'common.cancel': 'キャンセル',
            'menu.play': 'プレイ',
            'game.score': 'スコア: {score}',
            'settings.volume': '音量設定'
        };

        return mockTranslations[key] || null;
    }

    /**
     * 品質スコアを計算
     */
    private calculateQualityScore(results: TranslationValidationResults): number {
        const totalItems = results.checkedItems;
        const errorCount = results.errors.length;
        const warningCount = results.warnings.length;

        if (totalItems === 0) return 0;

        // エラーは重い減点、警告は軽い減点
        const errorPenalty = errorCount * 10;
        const warningPenalty = warningCount * 3;

        const baseScore = 100;
        const finalScore = Math.max(0, baseScore - errorPenalty - warningPenalty);
        return Math.round(finalScore);
    }

    /**
     * 品質グレードを取得
     */
    private getQualityGrade(score: number): string {
        if (score >= this.qualityThresholds.excellent) return 'excellent';
        if (score >= this.qualityThresholds.good) return 'good';
        if (score >= this.qualityThresholds.acceptable) return 'acceptable';
        if (score >= this.qualityThresholds.poor) return 'poor';
        return 'unacceptable';
    }

    /**
     * 品質統計を更新
     */
    private updateQualityStats(results: TranslationValidationResults): void {
        this.qualityStats.totalChecks++;

        if (results.errors.length === 0) {
            this.qualityStats.passedChecks++;
        } else {
            this.qualityStats.failedChecks++;
        }
        this.qualityStats.warnings += results.warnings.length;
    }

    /**
     * 品質レポートを生成
     */
    generateQualityReport(results: TranslationValidationResults): QualityReport {
        const report: QualityReport = {
            summary: {
                language: results.language,
                totalItems: results.totalItems,
                checkedItems: results.checkedItems,
                qualityScore: results.qualityScore,
                qualityGrade: results.qualityGrade,
                errorCount: results.errors.length,
                warningCount: results.warnings.length
            },
            details: {
                errors: results.errors,
                warnings: results.warnings,
                passed: results.passed
            },
            recommendations: this.generateRecommendations(results),
            timestamp: results.timestamp
        };

        return report;
    }

    /**
     * 改善提案を生成
     */
    private generateRecommendations(results: TranslationValidationResults): Recommendation[] {
        const recommendations: Recommendation[] = [];

        if (results.errors.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'error_fix',
                message: `${results.errors.length}個のエラーを修正してください`,
                action: 'すべてのエラーを解決してから公開してください'
            });
        }

        if (results.warnings.length > 5) {
            recommendations.push({
                priority: 'medium',
                type: 'warning_review',
                message: `警告が多すぎます（${results.warnings.length}個）`,
                action: '警告を確認し、可能な限り解決してください'
            });
        }

        if (results.qualityScore < this.qualityThresholds.acceptable) {
            recommendations.push({
                priority: 'high',
                type: 'quality_improvement',
                message: '品質スコアが低すぎます',
                action: '翻訳品質の見直しが必要です'
            });
        }

        return recommendations;
    }

    /**
     * 統計情報を取得
     */
    getStats(): QualityStats & { activeRules: ValidationRule[]; qualityThresholds: QualityThresholds } {
        return {
            ...this.qualityStats,
            activeRules: Array.from(this.validationRules.values()).filter(rule => rule.enabled),
            qualityThresholds: this.qualityThresholds
        };
    }

    /**
     * 設定を更新
     */
    updateSettings(settings: QualitySettings): void {
        if (settings.qualityThresholds) {
            Object.assign(this.qualityThresholds, settings.qualityThresholds);
        }

        if (settings.rules) {
            settings.rules.forEach(ruleSettings => {
                const rule = this.validationRules.get(ruleSettings.id);
                if (rule) {
                    if (ruleSettings.enabled !== undefined) {
                        rule.enabled = ruleSettings.enabled;
                    }
                    if (ruleSettings.severity !== undefined) {
                        rule.severity = ruleSettings.severity;
                    }
                }
            });
        }

        console.log('QualityChecker settings updated:', settings);
    }

    /**
     * 言語の品質をチェック
     */
    async checkLanguageQuality(language: string, options: { rules?: string[] } = {}): Promise<{
        score: number;
        grade: string;
        errors: ValidationIssue[];
        warnings: ValidationIssue[];
        passed: ValidationIssue[];
    }> {
        // モック実装 - 実際の実装では言語固有の検証を実行
        const mockResults = {
            score: 85,
            grade: 'good',
            errors: [],
            warnings: [],
            passed: []
        };

        return mockResults;
    }
}

// シングルトンインスタンス
let qualityCheckerInstance: QualityChecker | null = null;

/**
 * QualityCheckerのシングルトンインスタンスを取得
 */
export function getQualityChecker(): QualityChecker {
    if (!qualityCheckerInstance) {
        qualityCheckerInstance = new QualityChecker();
    }
    return qualityCheckerInstance;
}