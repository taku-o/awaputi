/**
 * 翻訳検証ルール集 - 各種翻訳品質検証ルールの実装
 */

// 型定義
export interface ValidationContext {
    targetLanguage?: string;
    sourceLanguage?: string;
    key?: string;
    category?: string;
    [key: string]: any;
}

export interface ValidationResult {
    passed: boolean;
    message: string;
    details?: any;
    suggestion?: string;
    severity: 'error' | 'warning';
}

export interface ParameterDetails {
    expected: string[];
    actual: string[];
    missing?: string[];
    extra?: string[];
}

export interface LengthDetails {
    sourceLength: number;
    translationLength: number;
    minLength: number;
    maxLength: number;
    language: string;
}

export interface LengthTolerance {
    min: number;
    max: number;
    name: string;
}

export interface FormatIssue {
    type: 'html_tags' | 'markdown' | 'special_characters';
    message: string;
    expected?: any;
    actual?: any;
    missing?: any;
    extra?: any;
}

export interface MarkdownElement {
    type: string;
    content: string;
}

export interface CulturalRule {
    term: string;
    reason: string;
    suggestion: string;
}

export interface CulturalRules {
    inappropriate: CulturalRule[];
    sensitive: CulturalRule[];
}

export interface CulturalIssue {
    type: 'inappropriate' | 'sensitive';
    term: string;
    reason: string;
    suggestion: string;
    severity: 'error' | 'warning';
}

export interface CompletenessIssue {
    type: 'untranslated_markers' | 'potential_untranslated' | 'too_short';
    message: string;
    markers?: string[];
    commonWords?: string[];
}

export interface ConsistencyIssue {
    type: string;
    message: string;
    examples?: string[];
    suggestion?: string;
}

export interface CapitalizationResult {
    passed: boolean;
    type?: string;
    message?: string;
    examples?: string[];
    suggestion?: string;
}

export interface PunctuationResult {
    passed: boolean;
    issues?: ConsistencyIssue[];
}

export interface PolitenessResult {
    passed: boolean;
    type?: string;
    message?: string;
    suggestion?: string;
}

export interface ValidationRuleConstructor {
    new (): IValidationRule;
}

export interface IValidationRule {
    name: string;
    description: string;
    severity: 'error' | 'warning';
    validate(sourceText: string, translationText: string, context?: ValidationContext): ValidationResult;
}

/**
 * パラメータ整合性検証ルール
 */
export class ParameterConsistencyRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';

    constructor() {
        this.name = 'パラメータ整合性ルール';
        this.description = '翻訳文中のパラメータ（{param}）が原文と一致するかチェック';
        this.severity = 'error';
    }
    
    /**
     * パラメータを抽出
     */
    extractParameters(text: string): string[] {
        const patterns = [
            /\{([^}]+)\}/g,     // {param}
            /\{\{([^}]+)\}\}/g, // {{param}}
            /%s/g,              // %s
            /%d/g,              // %d
            /%\d+\$?s/g,        // %1$s, %2s
            /%\(\w+\)s/g        // %(name)s
        ];
        
        const params = new Set<string>();
        
        patterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            while ((match = regex.exec(text)) !== null) {
                params.add(match[0]);
            }
        });
        
        return Array.from(params).sort();
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        if (!sourceText || !translationText) {
            return {
                passed: false,
                message: '検証に必要なテキストが不足しています',
                severity: this.severity
            };
        }
        
        const sourceParams = this.extractParameters(sourceText);
        const translationParams = this.extractParameters(translationText);
        
        // パラメータ数の比較
        if (sourceParams.length !== translationParams.length) {
            return {
                passed: false,
                message: `パラメータ数不一致（元: ${sourceParams.length}, 翻訳: ${translationParams.length}）`,
                details: {
                    expected: sourceParams,
                    actual: translationParams
                } as ParameterDetails,
                suggestion: `必要なパラメータ: ${sourceParams.join(', ')}`,
                severity: this.severity
            };
        }
        
        // パラメータ内容の比較
        const missingParams = sourceParams.filter(param => !translationParams.includes(param));
        const extraParams = translationParams.filter(param => !sourceParams.includes(param));
        
        if (missingParams.length > 0 || extraParams.length > 0) {
            const issues: string[] = [];
            if (missingParams.length > 0) {
                issues.push(`不足: ${missingParams.join(', ')}`);
            }
            if (extraParams.length > 0) {
                issues.push(`余分: ${extraParams.join(', ')}`);
            }
            
            return {
                passed: false,
                message: `パラメータ不一致（${issues.join(', ')}）`,
                details: {
                    missing: missingParams,
                    extra: extraParams,
                    expected: sourceParams,
                    actual: translationParams
                } as ParameterDetails,
                suggestion: `正しいパラメータ: ${sourceParams.join(', ')}`,
                severity: this.severity
            };
        }
        
        return {
            passed: true,
            message: 'パラメータが正しく含まれています',
            severity: this.severity
        };
    }
}

/**
 * 翻訳長制限検証ルール
 */
export class LengthValidationRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';
    private lengthTolerances: Record<string, LengthTolerance>;

    constructor() {
        this.name = '翻訳長制限ルール';
        this.description = '翻訳文の長さが適切な範囲内かチェック';
        this.severity = 'warning';
        
        // 言語別の長さ許容率
        this.lengthTolerances = {
            'en': { min: 0.7, max: 1.5, name: '英語' },
            'zh-CN': { min: 0.5, max: 1.2, name: '中国語簡体字' },
            'zh-TW': { min: 0.5, max: 1.2, name: '中国語繁体字' },
            'ko': { min: 0.8, max: 1.4, name: '韓国語' },
            'default': { min: 0.6, max: 1.8, name: 'その他' }
        };
    }
    
    /**
     * 実際の文字数を計算（絵文字や特殊文字を考慮）
     */
    calculateTextLength(text: string): number {
        // Unicode正規化
        const normalized = text.normalize('NFC');
        
        // 絵文字や結合文字を1文字として数える
        const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
        const segments = Array.from(segmenter.segment(normalized));
        
        return segments.length;
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        if (!sourceText || !translationText) {
            return {
                passed: false,
                message: '検証に必要なテキストが不足しています',
                severity: this.severity
            };
        }
        
        const targetLanguage = context.targetLanguage || 'default';
        const tolerance = this.lengthTolerances[targetLanguage] || this.lengthTolerances.default;
        
        const sourceLength = this.calculateTextLength(sourceText);
        const translationLength = this.calculateTextLength(translationText);
        
        const minLength = Math.floor(sourceLength * tolerance.min);
        const maxLength = Math.ceil(sourceLength * tolerance.max);
        
        // 短すぎる場合
        if (translationLength < minLength) {
            return {
                passed: false,
                message: `翻訳が短すぎます（${translationLength}文字, 最小推奨: ${minLength}文字）`,
                details: {
                    sourceLength: sourceLength,
                    translationLength: translationLength,
                    minLength: minLength,
                    maxLength: maxLength,
                    language: tolerance.name
                } as LengthDetails,
                suggestion: '翻訳が完全で、重要な情報が欠けていないか確認してください',
                severity: this.severity
            };
        }
        
        // 長すぎる場合
        if (translationLength > maxLength) {
            return {
                passed: false,
                message: `翻訳が長すぎます（${translationLength}文字, 最大推奨: ${maxLength}文字）`,
                details: {
                    sourceLength: sourceLength,
                    translationLength: translationLength,
                    minLength: minLength,
                    maxLength: maxLength,
                    language: tolerance.name
                } as LengthDetails,
                suggestion: 'より簡潔で自然な表現を検討してください',
                severity: this.severity
            };
        }
        
        return {
            passed: true,
            message: `適切な長さです（${translationLength}文字, 範囲: ${minLength}-${maxLength}文字）`,
            details: {
                sourceLength: sourceLength,
                translationLength: translationLength,
                language: tolerance.name
            },
            severity: this.severity
        };
    }
}

/**
 * フォーマット検証ルール
 */
export class FormatValidationRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';

    constructor() {
        this.name = 'フォーマット検証ルール';
        this.description = 'HTML要素、マークダウン記法等のフォーマットが保持されているかチェック';
        this.severity = 'error';
    }
    
    /**
     * HTMLタグを抽出・正規化
     */
    extractHtmlTags(text: string): string[] {
        const htmlTagPattern = /<\/?[a-zA-Z][^>]*>/g;
        const matches = text.match(htmlTagPattern) || [];
        
        // タグを正規化（属性を除去して純粋なタグ名のみ）
        return matches.map(tag => {
            const normalized = tag.replace(/<\/?([a-zA-Z]+)[^>]*>/g, '<$1>');
            return normalized.toLowerCase();
        }).sort();
    }
    
    /**
     * マークダウン要素を抽出
     */
    extractMarkdownElements(text: string): MarkdownElement[] {
        const patterns = [
            { type: 'bold', pattern: /\*\*[^*\n]+\*\*/g },
            { type: 'italic', pattern: /\*[^*\n]+\*/g },
            { type: 'code', pattern: /`[^`\n]+`/g },
            { type: 'code_block', pattern: /```[\s\S]*?```/g },
            { type: 'link', pattern: /\[[^\]]+\]\([^)]+\)/g },
            { type: 'header', pattern: /^#{1,6}\s+.+$/gm },
            { type: 'list', pattern: /^[-*+]\s+.+$/gm },
            { type: 'ordered_list', pattern: /^\d+\.\s+.+$/gm }
        ];
        
        const elements: MarkdownElement[] = [];
        patterns.forEach(({ type, pattern }) => {
            const matches = text.match(pattern) || [];
            matches.forEach(match => {
                elements.push({ type, content: match });
            });
        });
        
        return elements;
    }
    
    /**
     * 特殊記号・句読点を抽出
     */
    extractSpecialCharacters(text: string): string[] {
        const specialChars = text.match(/[()[\]{}<>「」『』【】〈〉《》]/g) || [];
        return specialChars.sort();
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        if (!sourceText || !translationText) {
            return {
                passed: false,
                message: '検証に必要なテキストが不足しています',
                severity: this.severity
            };
        }
        
        const issues: FormatIssue[] = [];
        
        // HTMLタグの検証
        const sourceHtmlTags = this.extractHtmlTags(sourceText);
        const translationHtmlTags = this.extractHtmlTags(translationText);
        
        if (sourceHtmlTags.length !== translationHtmlTags.length) {
            issues.push({
                type: 'html_tags',
                message: `HTMLタグ数不一致（元: ${sourceHtmlTags.length}, 翻訳: ${translationHtmlTags.length}）`,
                expected: sourceHtmlTags,
                actual: translationHtmlTags
            });
        } else {
            const missingTags = sourceHtmlTags.filter(tag => !translationHtmlTags.includes(tag));
            const extraTags = translationHtmlTags.filter(tag => !sourceHtmlTags.includes(tag));
            
            if (missingTags.length > 0 || extraTags.length > 0) {
                issues.push({
                    type: 'html_tags',
                    message: 'HTMLタグが一致しません',
                    missing: missingTags,
                    extra: extraTags
                });
            }
        }
        
        // マークダウン記法の検証
        const sourceMarkdown = this.extractMarkdownElements(sourceText);
        const translationMarkdown = this.extractMarkdownElements(translationText);
        
        const sourceMarkdownTypes = sourceMarkdown.map(md => md.type).sort();
        const translationMarkdownTypes = translationMarkdown.map(md => md.type).sort();
        
        if (JSON.stringify(sourceMarkdownTypes) !== JSON.stringify(translationMarkdownTypes)) {
            issues.push({
                type: 'markdown',
                message: 'マークダウン記法が一致しません',
                expected: sourceMarkdownTypes,
                actual: translationMarkdownTypes
            });
        }
        
        // 特殊記号の検証
        const sourceSpecialChars = this.extractSpecialCharacters(sourceText);
        const translationSpecialChars = this.extractSpecialCharacters(translationText);
        
        if (JSON.stringify(sourceSpecialChars) !== JSON.stringify(translationSpecialChars)) {
            issues.push({
                type: 'special_characters',
                message: '括弧や特殊記号が一致しません',
                expected: sourceSpecialChars,
                actual: translationSpecialChars
            });
        }
        
        if (issues.length > 0) {
            return {
                passed: false,
                message: `フォーマット検証で${issues.length}個の問題が見つかりました`,
                details: issues,
                suggestion: '原文のフォーマット要素を正確に翻訳に反映してください',
                severity: this.severity
            };
        }
        
        return {
            passed: true,
            message: 'フォーマットが正しく保持されています',
            severity: this.severity
        };
    }
}

/**
 * 文化的適切性検証ルール
 */
export class CulturalAppropriatenessRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';
    private culturalRules: Record<string, CulturalRules>;

    constructor() {
        this.name = '文化的適切性ルール';
        this.description = '文化的に不適切な表現や誤解を招く表現がないかチェック';
        this.severity = 'warning';
        
        this.culturalRules = this.initializeCulturalRules();
    }
    
    /**
     * 文化的配慮ルールを初期化
     */
    private initializeCulturalRules(): Record<string, CulturalRules> {
        return {
            'en': {
                inappropriate: [
                    { term: 'jap', reason: '差別的表現', suggestion: 'Japanese' },
                    { term: 'oriental', reason: '古い表現', suggestion: 'Asian' },
                    { term: 'colored', reason: '不適切な表現', suggestion: 'person of color' }
                ],
                sensitive: [
                    { term: 'christmas', reason: '宗教的配慮', suggestion: 'holiday season を検討' },
                    { term: 'blind', reason: '障害に関する配慮', suggestion: 'visually impaired' }
                ]
            },
            'zh-CN': {
                inappropriate: [
                    { term: '台湾国', reason: '政治的に不適切', suggestion: '台湾地区' },
                    { term: '中华民国', reason: '政治的配慮', suggestion: '台湾' }
                ],
                sensitive: [
                    { term: '独立', reason: '政治的に敏感', suggestion: '慎重な表現を検討' }
                ]
            },
            'zh-TW': {
                inappropriate: [
                    { term: '大陆', reason: '中立的でない表現', suggestion: '中国大陆' },
                    { term: '内地', reason: '中立的でない表現', suggestion: '中国大陆' }
                ],
                sensitive: [
                    { term: '统一', reason: '政治的に敏感', suggestion: '慎重な表現を検討' }
                ]
            },
            'ko': {
                inappropriate: [
                    { term: '왜놈', reason: '差別的表現', suggestion: '일본인' },
                    { term: '쪽발이', reason: '差別的表現', suggestion: '일본인' },
                    { term: '짱깨', reason: '差別的表現', suggestion: '중국인' }
                ],
                sensitive: [
                    { term: '위안부', reason: '歴史的に敏感', suggestion: '慰安婦 문제（適切な文脈で）' }
                ]
            }
        };
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        if (!translationText) {
            return {
                passed: false,
                message: '翻訳テキストが不足しています',
                severity: this.severity
            };
        }
        
        const targetLanguage = context.targetLanguage;
        const rules = targetLanguage ? this.culturalRules[targetLanguage] : undefined;
        
        if (!rules) {
            return {
                passed: true,
                message: `${targetLanguage}の文化的配慮ルールが定義されていません`,
                severity: this.severity
            };
        }
        
        const issues: CulturalIssue[] = [];
        const lowerTranslation = translationText.toLowerCase();
        
        // 不適切な表現のチェック
        rules.inappropriate.forEach(rule => {
            if (lowerTranslation.includes(rule.term.toLowerCase())) {
                issues.push({
                    type: 'inappropriate',
                    term: rule.term,
                    reason: rule.reason,
                    suggestion: rule.suggestion,
                    severity: 'error'
                });
            }
        });
        
        // 配慮が必要な表現のチェック
        rules.sensitive.forEach(rule => {
            if (lowerTranslation.includes(rule.term.toLowerCase())) {
                issues.push({
                    type: 'sensitive',
                    term: rule.term,
                    reason: rule.reason,
                    suggestion: rule.suggestion,
                    severity: 'warning'
                });
            }
        });
        
        if (issues.length > 0) {
            const inappropriateCount = issues.filter(i => i.type === 'inappropriate').length;
            const sensitiveCount = issues.filter(i => i.type === 'sensitive').length;
            
            let message = '';
            if (inappropriateCount > 0) {
                message += `不適切な表現: ${inappropriateCount}個`;
            }
            if (sensitiveCount > 0) {
                if (message) message += ', ';
                message += `配慮が必要な表現: ${sensitiveCount}個`;
            }
            
            return {
                passed: false,
                message: `文化的配慮で問題が見つかりました（${message}）`,
                details: issues,
                suggestion: '文化的に適切で敬意を払った表現に修正してください',
                severity: inappropriateCount > 0 ? 'error' : 'warning'
            };
        }
        
        return {
            passed: true,
            message: '文化的に適切な表現です',
            severity: this.severity
        };
    }
    
    /**
     * 新しい文化的ルールを追加
     */
    addCulturalRule(language: string, type: 'inappropriate' | 'sensitive', rule: CulturalRule): void {
        if (!this.culturalRules[language]) {
            this.culturalRules[language] = { inappropriate: [], sensitive: [] };
        }
        
        if (!this.culturalRules[language][type]) {
            this.culturalRules[language][type] = [];
        }
        
        this.culturalRules[language][type].push(rule);
    }
}

/**
 * 翻訳完成度検証ルール
 */
export class CompletenessValidationRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';
    private untranslatedMarkers: string[];

    constructor() {
        this.name = '翻訳完成度ルール';
        this.description = '空文字や未翻訳の項目がないかチェック';
        this.severity = 'error';
        
        this.untranslatedMarkers = [
            'TODO', 'FIXME', 'TBD', 'XXX',
            '[未翻訳]', '[TODO]', '[FIXME]',
            'NOT_TRANSLATED', 'UNTRANSLATED',
            '未翻译', '미번역', 'Not translated'
        ];
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        const issues: CompletenessIssue[] = [];
        
        // 空文字チェック
        if (!translationText || translationText.trim() === '') {
            return {
                passed: false,
                message: '翻訳が空です',
                suggestion: '翻訳を追加してください',
                severity: this.severity
            };
        }
        
        // 未翻訳マーカーのチェック
        const foundMarkers = this.untranslatedMarkers.filter(marker => 
            translationText.toUpperCase().includes(marker.toUpperCase())
        );
        
        if (foundMarkers.length > 0) {
            issues.push({
                type: 'untranslated_markers',
                markers: foundMarkers,
                message: `未翻訳マーカーが含まれています: ${foundMarkers.join(', ')}`
            });
        }
        
        // 原文がそのまま含まれていないかチェック
        if (sourceText && sourceText.length > 10) {
            const sourceWords = sourceText.split(/\s+/).filter(word => word.length > 3);
            const translationWords = translationText.split(/\s+/).filter(word => word.length > 3);
            
            const commonWords = sourceWords.filter(word => 
                translationWords.some(tWord => 
                    word.toLowerCase() === tWord.toLowerCase()
                )
            );
            
            // 共通単語が多すぎる場合（70%以上）
            if (sourceWords.length > 0 && (commonWords.length / sourceWords.length) > 0.7) {
                issues.push({
                    type: 'potential_untranslated',
                    message: '原文がそのまま含まれている可能性があります',
                    commonWords: commonWords.slice(0, 5) // 最初の5個だけ表示
                });
            }
        }
        
        // 極端に短い翻訳のチェック
        if (sourceText && translationText.length < 3 && sourceText.length > 10) {
            issues.push({
                type: 'too_short',
                message: '翻訳が極端に短すぎます'
            });
        }
        
        if (issues.length > 0) {
            return {
                passed: false,
                message: `翻訳完成度で${issues.length}個の問題が見つかりました`,
                details: issues,
                suggestion: '翻訳を完成させ、未翻訳マーカーを除去してください',
                severity: this.severity
            };
        }
        
        return {
            passed: true,
            message: '翻訳が適切に完成しています',
            severity: this.severity
        };
    }
    
    /**
     * 未翻訳マーカーを追加
     */
    addUntranslatedMarker(marker: string): void {
        if (!this.untranslatedMarkers.includes(marker)) {
            this.untranslatedMarkers.push(marker);
        }
    }
}

/**
 * 翻訳一貫性検証ルール
 */
export class ConsistencyValidationRule implements IValidationRule {
    public name: string;
    public description: string;
    public severity: 'error' | 'warning';

    constructor() {
        this.name = '翻訳一貫性ルール';
        this.description = '翻訳の一貫性をチェック';
        this.severity = 'warning';
    }
    
    /**
     * 大文字化パターンをチェック（英語）
     */
    private checkCapitalizationConsistency(text: string, language?: string): CapitalizationResult {
        if (language !== 'en') return { passed: true };
        
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        const inconsistentSentences = sentences.filter(sentence => {
            return sentence.length > 0 && !/^[A-Z]/.test(sentence);
        });
        
        if (inconsistentSentences.length > 0) {
            return {
                passed: false,
                type: 'capitalization',
                message: '文の始まりの大文字化が一貫していません',
                examples: inconsistentSentences.slice(0, 3),
                suggestion: '各文の始まりを大文字にしてください'
            };
        }
        
        return { passed: true };
    }
    
    /**
     * 句読点の一貫性をチェック
     */
    private checkPunctuationConsistency(sourceText: string | undefined, translationText: string, language?: string): PunctuationResult {
        if (!sourceText) return { passed: true };
        
        const issues: ConsistencyIssue[] = [];
        
        // 文末句読点のチェック
        const sourceEndsWithPeriod = /[.。！？!?]$/.test(sourceText.trim());
        const translationEndsWithPeriod = /[.。！？!?]$/.test(translationText.trim());
        
        if (sourceEndsWithPeriod && !translationEndsWithPeriod) {
            issues.push({
                type: 'missing_end_punctuation',
                message: '文末の句読点が不足しています',
                suggestion: '原文に合わせて適切な句読点を追加してください'
            });
        }
        
        // 疑問符・感嘆符のチェック
        const sourceQuestions = (sourceText.match(/[？?]/g) || []).length;
        const translationQuestions = (translationText.match(/[？?]/g) || []).length;
        
        if (sourceQuestions !== translationQuestions) {
            issues.push({
                type: 'question_mark_mismatch',
                message: `疑問符の数が一致しません（元: ${sourceQuestions}, 翻訳: ${translationQuestions}）`,
                suggestion: '疑問文は適切に疑問符で終わらせてください'
            });
        }
        
        const sourceExclamations = (sourceText.match(/[！!]/g) || []).length;
        const translationExclamations = (translationText.match(/[！!]/g) || []).length;
        
        if (sourceExclamations !== translationExclamations) {
            issues.push({
                type: 'exclamation_mark_mismatch',
                message: `感嘆符の数が一致しません（元: ${sourceExclamations}, 翻訳: ${translationExclamations}）`,
                suggestion: '感嘆文は適切に感嘆符で終わらせてください'
            });
        }
        
        return issues.length > 0 ? { passed: false, issues } : { passed: true };
    }
    
    /**
     * 敬語レベルの一貫性をチェック（日本語・韓国語）
     */
    private checkPolitenessConsistency(text: string, language?: string): PolitenessResult {
        if (!language || !['ja', 'ko'].includes(language)) return { passed: true };
        
        if (language === 'ja') {
            const politeEndings = text.match(/[です、ます、でした、ました]/g) || [];
            const casualEndings = text.match(/[だ、である、する]/g) || [];
            
            if (politeEndings.length > 0 && casualEndings.length > 0) {
                return {
                    passed: false,
                    type: 'politeness_inconsistency',
                    message: '敬語レベルが一貫していません（丁寧語と普通語が混在）',
                    suggestion: 'どちらか一方の敬語レベルに統一してください'
                };
            }
        }
        
        return { passed: true };
    }
    
    /**
     * 検証実行
     */
    validate(sourceText: string, translationText: string, context: ValidationContext = {}): ValidationResult {
        if (!translationText) {
            return {
                passed: false,
                message: '翻訳テキストが不足しています',
                severity: this.severity
            };
        }
        
        const targetLanguage = context.targetLanguage || 'unknown';
        const issues: (CapitalizationResult | ConsistencyIssue | PolitenessResult)[] = [];
        
        // 大文字化の一貫性チェック
        const capitalizationResult = this.checkCapitalizationConsistency(translationText, targetLanguage);
        if (!capitalizationResult.passed) {
            issues.push(capitalizationResult);
        }
        
        // 句読点の一貫性チェック
        const punctuationResult = this.checkPunctuationConsistency(sourceText, translationText, targetLanguage);
        if (!punctuationResult.passed && punctuationResult.issues) {
            issues.push(...punctuationResult.issues);
        }
        
        // 敬語レベルの一貫性チェック
        const politenessResult = this.checkPolitenessConsistency(translationText, targetLanguage);
        if (!politenessResult.passed) {
            issues.push(politenessResult);
        }
        
        if (issues.length > 0) {
            return {
                passed: false,
                message: `翻訳一貫性で${issues.length}個の問題が見つかりました`,
                details: issues,
                suggestion: '翻訳全体の一貫性を確認し、統一された表現を使用してください',
                severity: this.severity
            };
        }
        
        return {
            passed: true,
            message: '翻訳の一貫性に問題ありません',
            severity: this.severity
        };
    }
}

/**
 * 検証ルールファクトリー
 */
export class ValidationRuleFactory {
    private ruleClasses: Map<string, ValidationRuleConstructor>;

    constructor() {
        this.ruleClasses = new Map<string, ValidationRuleConstructor>([
            ['parameterConsistency', ParameterConsistencyRule],
            ['lengthValidation', LengthValidationRule],
            ['formatValidation', FormatValidationRule],
            ['culturalAppropriateness', CulturalAppropriatenessRule],
            ['completenessCheck', CompletenessValidationRule],
            ['consistencyCheck', ConsistencyValidationRule]
        ]);
    }
    
    /**
     * 検証ルールを作成
     */
    createRule(ruleType: string): IValidationRule {
        const RuleClass = this.ruleClasses.get(ruleType);
        if (!RuleClass) {
            throw new Error(`Unknown validation rule type: ${ruleType}`);
        }
        
        return new RuleClass();
    }
    
    /**
     * すべての利用可能なルールタイプを取得
     */
    getAvailableRuleTypes(): string[] {
        return Array.from(this.ruleClasses.keys());
    }
    
    /**
     * 新しいルールクラスを登録
     */
    registerRule(ruleType: string, RuleClass: ValidationRuleConstructor): void {
        this.ruleClasses.set(ruleType, RuleClass);
    }
}

// デフォルトファクトリーインスタンス
export const validationRuleFactory = new ValidationRuleFactory();