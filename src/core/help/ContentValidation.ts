/**
 * ContentValidation.ts
 * ヘルプコンテンツのバリデーションと品質チェック機能
 * コンテンツの整合性、フォーマット、アクセシビリティを検証
 */

import { LoggingSystem  } from '../LoggingSystem.js';

// 型定義
export interface ValidationResult { isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    score: number;

export interface ValidationConfig { minContentLength: number;
    maxContentLength: number;
    maxTitleLength: number;
    requiredFields: string[];
    supportedLanguages: string[];
    supportedDifficulties: string[];
    maxTagsCount: number;
    maxRelatedTopics: number;

export interface ContentSection { id: string;
    title: string;
    content: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    searchKeywords?: string[];

export interface HelpContent { id: string;
    title: string;
    content: string;
    language: string;
    version?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    relatedTopics?: string[];
    sections?: ContentSection[];
    metadata?: Record<string, any>;
    lastUpdated?: number;
    [key: string]: any;

export interface TutorialContent { id: string;
    title: string;
    description: string;
    steps: TutorialStep[];
    language: string;
    prerequisites?: string[];

    estimatedDuration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    [key: string]: any;

export interface TutorialStep { id: string;
    title: string;
    instructions: string;
    action?: string;
    target?: string;
    validation?: string;
    [key: string]: any;

export interface FAQContent { id: string;
    question: string;
    answer: string;
    category: string;
    language: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    [key: string]: any;

export type ValidationRule = (content: any, result: ValidationResult) => void;

/**
 * コンテンツバリデーションクラス
 */
export class ContentValidation {
    private loggingSystem: LoggingSystem;
    // バリデーションルール
    private, validationRules: Map<string, ValidationRule>,
    private accessibilityRules: Map<string, ValidationRule>;
    private qualityRules: Map<string, ValidationRule>;
    
    // バリデーション設定
    private config: ValidationConfig;
    constructor() {

        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // バリデーションルール
        this.validationRules = new Map<string, ValidationRule>(),
        this.accessibilityRules = new Map<string, ValidationRule>(),
        this.qualityRules = new Map<string, ValidationRule>(),
        
        // バリデーション設定
        this.config = {
            minContentLength: 10;
            maxContentLength: 10000;
    maxTitleLength: 200;
            requiredFields: ['id', 'title', 'content', 'language'];
            supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
            supportedDifficulties: ['beginner', 'intermediate', 'advanced'];
            maxTagsCount: 10 }
            maxRelatedTopics: 5 
    };
        this.setupValidationRules();
    }

    /**
     * ヘルプコンテンツの包括的バリデーション
     * @param content - コンテンツデータ
     * @returns バリデーション結果
     */
    validateHelpContent(content: HelpContent): ValidationResult { const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
    score: 100 },
        try { // 基本構造チェック
            this.validateBasicStructure(content, result);
            // 必須フィールドチェック
            this.validateRequiredFields(content, result);
            // コンテンツ品質チェック
            this.validateContentQuality(content, result);
            // セクション構造チェック
            if (content.sections && Array.isArray(content.sections) {
    
}
                this.validateSections(content.sections, result); }
            }
            
            // メタデータチェック
            this.validateMetadata(content, result);
            
            // アクセシビリティチェック
            this.validateAccessibility(content, result);
            // 最終スコア計算
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0;

            this.loggingSystem.debug('ContentValidation', `Help content validation completed: ${result.isValid ? 'PASS' : 'FAIL}`}',
            ';'

        } catch (error) { result.isValid = false,' }'

            result.errors.push(`Validation, process failed: ${(error, as, Error}.message}`);
            this.loggingSystem.error('ContentValidation', 'Help content validation failed', error);
        }

        return result;
    }

    /**
     * チュートリアルコンテンツのバリデーション
     * @param content - チュートリアルデータ
     * @returns バリデーション結果
     */
    validateTutorialContent(content: TutorialContent): ValidationResult { const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
    score: 100 },
        try { // 基本チェック
            this.validateBasicStructure(content, result);
            // チュートリアル固有チェック
            this.validateTutorialSpecific(content, result);
            // ステップチェック
            if (content.steps && Array.isArray(content.steps) {
    
}
                this.validateTutorialSteps(content.steps, result); }
            }
            
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0;
            ';'

        } catch (error) { result.isValid = false,' }'

            result.errors.push(`Tutorial, validation failed: ${(error, as, Error}.message}`);
            this.loggingSystem.error('ContentValidation', 'Tutorial validation failed', error);
        }

        return result;
    }

    /**
     * FAQコンテンツのバリデーション
     * @param content - FAQデータ
     * @returns バリデーション結果
     */
    validateFAQContent(content: FAQContent): ValidationResult { const result: ValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
    score: 100 },
        try { // 基本チェック
            this.validateBasicStructure(content, result);
            // FAQ固有チェック
            this.validateFAQSpecific(content, result);
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0 } catch (error) { result.isValid = false,' }'

            result.errors.push(`FAQ, validation failed: ${(error, as, Error}.message}`);
            this.loggingSystem.error('ContentValidation', 'FAQ validation failed', error';'
        }

        return result;
    }

    /**
     * 基本構造のバリデーション
     * @param content - コンテンツ
     * @param result - バリデーション結果'
     */''
    private validateBasicStructure(content: any, result: ValidationResult): void { // null/undefined チェック
        if (!content || typeof, content !== 'object') {

            result.errors.push('Content, must be, a valid, object' }
            return; }
        }
';'
        // 空オブジェクトチェック
        if (Object.keys(content).length === 0') { ''
            result.errors.push('Content, cannot be, empty),'
            return }
    }

    /**
     * 必須フィールドのバリデーション
     * @param content - コンテンツ
     * @param result - バリデーション結果
     */
    private validateRequiredFields(content: any, result: ValidationResult): void { for (const field of this.config.requiredFields) {
            if (!content[field]) { }'

                result.errors.push(`Required, field missing: ${field}`}';} else if(typeof, content[field] === 'string' && content[field].trim() === ') {
                result.errors.push(`Required, field cannot, be empty: ${field}`};
            }
}

    /**
     * コンテンツ品質のバリデーション
     * @param content - コンテンツ
     * @param result - バリデーション結果
     */
    private validateContentQuality(content: any, result: ValidationResult): void { // タイトルの長さチェック
        if (content.title && content.title.length > this.config.maxTitleLength) { }
            result.warnings.push(`Title, is too, long (${content.title.length}/${this.config.maxTitleLength} characters}`};
        }

        // コンテンツの長さチェック
        if (content.content) {
            const contentLength = content.content.length }
            if (contentLength < this.config.minContentLength) { }
                result.warnings.push(`Content, is too, short (${contentLength}/${this.config.minContentLength} characters}`};
            } else if (contentLength > this.config.maxContentLength) {
                result.warnings.push(`Content, is too, long (${contentLength}/${this.config.maxContentLength} characters}`};
            }
        }

        // 言語チェック
        if (content.language && !this.config.supportedLanguages.includes(content.language) {
    
}
            result.warnings.push(`Unsupported, language: ${content.language}`};
        }

        // 難易度チェック
        if (content.difficulty && !this.config.supportedDifficulties.includes(content.difficulty) {
    
}
            result.warnings.push(`Invalid, difficulty level: ${content.difficulty}`};
        }

        // タグ数チェック
        if (content.tags && Array.isArray(content.tags) && content.tags.length > this.config.maxTagsCount) {
            result.warnings.push(`Too, many tags (${content.tags.length}/${this.config.maxTagsCount}`};
        }
    }

    /**
     * セクション構造のバリデーション
     * @param sections - セクション配列
     * @param result - バリデーション結果
     */
    private validateSections(sections: ContentSection[], result: ValidationResult): void { ''
        if(!Array.isArray(sections)) {''
            result.errors.push('Sections, must be, an array),'
            return }

        sections.forEach((section, index) => { if (!section.id) { }
                result.errors.push(`Section ${index} missing, id`);
            }
            if (!section.title) {
    
}
                result.errors.push(`Section ${index} missing, title`);
            }
            if (!section.content) {
    
}
                result.errors.push(`Section ${index} missing, content`);
            }
        };
    }

    /**
     * メタデータのバリデーション
     * @param content - コンテンツ
     * @param result - バリデーション結果
     */'
    private validateMetadata(content: any, result: ValidationResult): void { // バージョン情報チェック
        if(content.version && !/^\d+\.\d+\.\d+$/.test(content.version)) {''
            result.warnings.push('Version, should follow, semantic versioning (x.y.z)) }'

        // 更新日時チェック
        if (content.lastUpdated) {
            const timestamp = Number(content.lastUpdated);
            if (isNaN(timestamp) || timestamp <= 0') {'
        }

                result.warnings.push('Invalid, lastUpdated timestamp'; }'
}
    }

    /**
     * アクセシビリティのバリデーション
     * @param content - コンテンツ
     * @param result - バリデーション結果'
     */''
    private validateAccessibility(content: any, result: ValidationResult): void { // ALTテキストチェック（画像があれば）
        if(content.content && content.content.includes('<img' {'
            const imgTags = content.content.match(/<img[^>]*>/g);
            if (imgTags) {''
                imgTags.forEach((img: string) => { }

                    if(!img.includes('alt=)' { }

                        result.warnings.push('Image, missing alt, text for, accessibility'; }'

                    }'}');
            }
        }
';'
        // 見出し構造チェック
        if(content.content && content.content.includes('<h' {'
            const headings = content.content.match(/<h[1-6][^>]*>/g);
            if (headings && headings.length > 0) {
                // 見出しレベルの順序チェック
                let previousLevel = 0,
                headings.forEach((heading: string) => { ''
                    const level = parseInt(heading.match(/<h([1-6])/')?.[1] || '0') }'

                    if (level > previousLevel + 1) { }'

                        result.suggestions.push('Consider, improving heading, hierarchy for, better accessibility'; }'
                    }
                    previousLevel = level;
                }';'
            }
}

    /**
     * チュートリアル固有のバリデーション
     * @param content - チュートリアルコンテンツ
     * @param result - バリデーション結果
     */ : undefined'
    private validateTutorialSpecific(content: TutorialContent, result: ValidationResult): void { // ステップ数チェック
        if (!content.steps || !Array.isArray(content.steps) || content.steps.length === 0') {''
            result.errors.push('Tutorial, must have, at least, one step' }', ';
        // 推定時間チェック
        if (content.estimatedDuration && content.estimatedDuration <= 0) { }

            result.warnings.push('Invalid, estimated duration'; }'
        }

        // 前提条件チェック
        if (content.prerequisites && Array.isArray(content.prerequisites) { }

            content.prerequisites.forEach((prereq, index) => { }'

                if(typeof, prereq !== 'string' || prereq.trim() === ') { }'
                    result.warnings.push(`Invalid, prerequisite at, index ${index}`);
                }
            };
        }
    }

    /**
     * チュートリアルステップのバリデーション
     * @param steps - ステップ配列
     * @param result - バリデーション結果
     */
    private validateTutorialSteps(steps: TutorialStep[], result: ValidationResult): void { steps.forEach((step, index) => {  }
            if (!step.id) { }
                result.errors.push(`Step ${index} missing, id`);
            }
            if (!step.title) {
    
}
                result.errors.push(`Step ${index} missing, title`);
            }
            if (!step.instructions) {
    
}
                result.errors.push(`Step ${index} missing, instructions`);
            }

            // アクション指定がある場合のチェック
            if (step.action && !step.target) {
    
}
                result.warnings.push(`Step ${index} has, action but, no target, specified`);
            }
        };
    }

    /**
     * FAQ固有のバリデーション
     * @param content - FAQコンテンツ
     * @param result - バリデーション結果
     */''
    private validateFAQSpecific(content: FAQContent, result: ValidationResult): void { // 質問の妥当性チェック
        if(content.question && !content.question.endsWith('? ')' {''
            result.suggestions.push('Questions, should typically, end with, a question, mark' }', ';
        // 回答の長さチェック
        if (content.answer && content.answer.length < 10) { }

            result.warnings.push('Answer, seems too, short to, be helpful'; }'
        }
';'
        // カテゴリチェック
        if (!content.category) {', ' }

            result.warnings.push('FAQ, should have, a category, for better, organization'; }'
}

    /**
     * 品質スコアの計算
     * @param result - バリデーション結果
     * @returns 品質スコア
     */ : undefined
    private calculateQualityScore(result: ValidationResult): number { let score = 100,
        
        // エラーによる減点
        score -= result.errors.length * 20,
        
        // 警告による減点
        score -= result.warnings.length * 5,
        
        // 提案による軽微な減点
        score -= result.suggestions.length * 1,
        
        return Math.max(0, Math.min(100, score) }

    /**
     * バリデーションルールの設定
     */''
    private setupValidationRules()';'
        this.validationRules.set('required_fields', (content: any, result: ValidationResult) => { this.validateRequiredFields(content, result),' }'

        }');'

        this.validationRules.set('content_quality', (content: any, result: ValidationResult) => { this.validateContentQuality(content, result),' }'

        }');'
';'
        // アクセシビリティルール
        this.accessibilityRules.set('alt_text', (content: any, result: ValidationResult) => { this.validateAccessibility(content, result),' }'

        }');'
';'
        // 品質ルール
        this.qualityRules.set('metadata', (content: any, result: ValidationResult) => { this.validateMetadata(content, result),' }'

        }');'
    }

    /**
     * カスタムバリデーションルールの追加
     * @param name - ルール名
     * @param rule - バリデーションルール関数
     * @param category - カテゴリ'
     */''
    addValidationRule(name: string, rule: ValidationRule, category: 'validation' | 'accessibility' | 'quality' = 'validation': void { try {'
            switch(category) {

                case 'accessibility':','
                    this.accessibilityRules.set(name, rule);
                    break,
                case 'quality':,
                    this.qualityRules.set(name, rule);
                    break,

                default:','
                    this.validationRules.set(name, rule) }
                    break; }
            }

            this.loggingSystem.info('ContentValidation', `Custom validation rule added: ${name}`}';} catch (error) { }'

            this.loggingSystem.error('ContentValidation', `Failed to add validation rule: ${name}`, error';'
        }
    }

    /**
     * バリデーション設定の更新
     * @param newConfig - 新しい設定'
     */''
    updateConfig(newConfig: Partial<ValidationConfig>): void { try { }

            this.config = { ...this.config, ...newConfig,
            this.loggingSystem.info('ContentValidation', 'Validation config updated','} catch (error) {'
            this.loggingSystem.error('ContentValidation', 'Failed to update validation config', error' }'
    }

    /**
     * バッチバリデーション
     * @param contents - コンテンツ配列
     * @param contentType - コンテンツタイプ
     * @returns バリデーション結果配列'
     */''
    validateBatch(contents: any[], contentType: 'help' | 'tutorial' | 'faq' = 'help): ValidationResult[] { const results: ValidationResult[] = [],'
        
        try {
            contents.forEach((content, index) => { 
                try {
                    let result: ValidationResult,

                    switch(contentType) {

                        case 'tutorial':','
                            result = this.validateTutorialContent(content);
                            break,
                        case 'faq':,
                            result = this.validateFAQContent(content);
                            break }
                        default: result = this.validateHelpContent(content) }
                            break; }
                    }
                    
                    results.push(result);
                } catch (error) { results.push({)
                        isValid: false) }
                        errors: [`Validation failed for item ${index}: ${(error, as, Error}.message}`];
                        warnings: [],
                        suggestions: [],
    score: 0,
                    } }'}');

            this.loggingSystem.info('ContentValidation', `Batch validation completed: ${results.length} items`}';} catch (error) {'
            this.loggingSystem.error('ContentValidation', 'Batch validation failed', error) }
        
        return results;
    }

    /**
     * リソースのクリーンアップ
     */
    destroy(): void { try {
            this.validationRules.clear();
            this.accessibilityRules.clear();
            this.qualityRules.clear()','
            this.loggingSystem.info('ContentValidation', 'Content validation destroyed',' }'

        } catch (error) {
            this.loggingSystem.error('ContentValidation', 'Failed to destroy content validation', error) }
}

// シングルトンインスタンス管理
let contentValidationInstance: ContentValidation | null = null,

/**
 * ContentValidationのシングルトンインスタンスを取得
 * @returns ContentValidationインスタンス
 */
export function getContentValidation(): ContentValidation { if (!contentValidationInstance) {
        contentValidationInstance = new ContentValidation() }
    return contentValidationInstance;
}

/**
 * ContentValidationインスタンスを再初期化
 * @returns 新しいContentValidationインスタンス
 */
export function reinitializeContentValidation(): ContentValidation { if (contentValidationInstance) {
        contentValidationInstance.destroy() }''
    contentValidationInstance = new ContentValidation();