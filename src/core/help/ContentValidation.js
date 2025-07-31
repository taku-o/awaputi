/**
 * ContentValidation.js
 * ヘルプコンテンツのバリデーションと品質チェック機能
 * コンテンツの整合性、フォーマット、アクセシビリティを検証
 */

import { LoggingSystem } from '../LoggingSystem.js';

/**
 * コンテンツバリデーションクラス
 */
export class ContentValidation {
    constructor() {
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // バリデーションルール
        this.validationRules = new Map();
        this.accessibilityRules = new Map();
        this.qualityRules = new Map();
        
        // バリデーション設定
        this.config = {
            minContentLength: 10,
            maxContentLength: 10000,
            maxTitleLength: 200,
            requiredFields: ['id', 'title', 'content', 'language'],
            supportedLanguages: ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'],
            supportedDifficulties: ['beginner', 'intermediate', 'advanced'],
            maxTagsCount: 10,
            maxRelatedTopics: 5
        };
        
        this.setupValidationRules();
    }

    /**
     * ヘルプコンテンツの包括的バリデーション
     * @param {Object} content - コンテンツデータ
     * @returns {Object} バリデーション結果
     */
    validateHelpContent(content) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            score: 100
        };

        try {
            // 基本構造チェック
            this.validateBasicStructure(content, result);
            
            // 必須フィールドチェック
            this.validateRequiredFields(content, result);
            
            // コンテンツ品質チェック
            this.validateContentQuality(content, result);
            
            // セクション構造チェック
            if (content.sections && Array.isArray(content.sections)) {
                this.validateSections(content.sections, result);
            }
            
            // メタデータチェック
            this.validateMetadata(content, result);
            
            // アクセシビリティチェック
            this.validateAccessibility(content, result);
            
            // 最終スコア計算
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0;
            
            this.loggingSystem.debug('ContentValidation', `Help content validation completed: ${result.isValid ? 'PASS' : 'FAIL'}`);
            
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Validation process failed: ${error.message}`);
            this.loggingSystem.error('ContentValidation', 'Help content validation failed', error);
        }

        return result;
    }

    /**
     * チュートリアルデータのバリデーション
     * @param {Object} tutorial - チュートリアルデータ
     * @returns {Object} バリデーション結果
     */
    validateTutorial(tutorial) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            score: 100
        };

        try {
            // 基本構造チェック
            this.validateBasicStructure(tutorial, result);
            
            // チュートリアル固有フィールド
            const requiredFields = ['id', 'title', 'steps', 'language'];
            this.validateRequiredFields(tutorial, result, requiredFields);
            
            // ステップ構造チェック
            if (tutorial.steps && Array.isArray(tutorial.steps)) {
                this.validateTutorialSteps(tutorial.steps, result);
            } else {
                result.errors.push('Tutorial must have steps array');
            }
            
            // 推定時間チェック
            this.validateEstimatedDuration(tutorial, result);
            
            // 前提条件チェック
            this.validatePrerequisites(tutorial, result);
            
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0;
            
        } catch (error) {
            result.isValid = false;
            result.errors.push(`Tutorial validation failed: ${error.message}`);
            this.loggingSystem.error('ContentValidation', 'Tutorial validation failed', error);
        }

        return result;
    }

    /**
     * FAQデータのバリデーション
     * @param {Object} faq - FAQデータ
     * @returns {Object} バリデーション結果
     */
    validateFAQ(faq) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            score: 100
        };

        try {
            // 基本構造チェック
            this.validateBasicStructure(faq, result);
            
            // FAQ固有フィールド
            const requiredFields = ['id', 'question', 'answer', 'language'];
            this.validateRequiredFields(faq, result, requiredFields);
            
            // 質問と回答の品質チェック
            this.validateQuestionAnswer(faq, result);
            
            // 投票データの整合性チェック
            this.validateVotingData(faq, result);
            
            // 関連質問の妥当性チェック
            this.validateRelatedQuestions(faq, result);
            
            result.score = this.calculateQualityScore(result);
            result.isValid = result.errors.length === 0;
            
        } catch (error) {
            result.isValid = false;
            result.errors.push(`FAQ validation failed: ${error.message}`);
            this.loggingSystem.error('ContentValidation', 'FAQ validation failed', error);
        }

        return result;
    }

    /**
     * コンテンツ整合性の一括チェック
     * @param {Array} contents - コンテンツ配列
     * @returns {Object} 整合性チェック結果
     */
    validateContentConsistency(contents) {
        const result = {
            isConsistent: true,
            issues: [],
            statistics: {
                totalContent: contents.length,
                validContent: 0,
                languageDistribution: {},
                categoryDistribution: {}
            }
        };

        try {
            const languageMap = new Map();
            const categoryMap = new Map();
            const idSet = new Set();
            
            for (const content of contents) {
                // ID重複チェック
                if (idSet.has(content.id)) {
                    result.issues.push(`Duplicate ID found: ${content.id}`);
                    result.isConsistent = false;
                } else {
                    idSet.add(content.id);
                }
                
                // 言語別コンテンツ管理
                if (content.language) {
                    if (!languageMap.has(content.language)) {
                        languageMap.set(content.language, []);
                    }
                    languageMap.get(content.language).push(content);
                    
                    result.statistics.languageDistribution[content.language] = 
                        (result.statistics.languageDistribution[content.language] || 0) + 1;
                }
                
                // カテゴリ別コンテンツ管理
                if (content.category) {
                    if (!categoryMap.has(content.category)) {
                        categoryMap.set(content.category, []);
                    }
                    categoryMap.get(content.category).push(content);
                    
                    result.statistics.categoryDistribution[content.category] = 
                        (result.statistics.categoryDistribution[content.category] || 0) + 1;
                }
                
                // 個別コンテンツバリデーション
                const validation = this.validateHelpContent(content);
                if (validation.isValid) {
                    result.statistics.validContent++;
                }
            }
            
            // 言語間の一貫性チェック
            this.checkLanguageConsistency(languageMap, result);
            
            // カテゴリ間の一貫性チェック
            this.checkCategoryConsistency(categoryMap, result);
            
        } catch (error) {
            result.isConsistent = false;
            result.issues.push(`Consistency check failed: ${error.message}`);
            this.loggingSystem.error('ContentValidation', 'Content consistency check failed', error);
        }

        return result;
    }

    // ---- プライベートメソッド ----

    /**
     * バリデーションルールの設定
     */
    setupValidationRules() {
        // 基本バリデーションルール
        this.validationRules.set('required_fields', (content, fields) => {
            const missing = fields.filter(field => !content[field] || content[field] === '');
            return missing.length === 0 ? null : `Missing required fields: ${missing.join(', ')}`;
        });

        this.validationRules.set('language_code', (language) => {
            if (!language || typeof language !== 'string') {
                return 'Language code is required';
            }
            if (!this.config.supportedLanguages.includes(language)) {
                return `Unsupported language: ${language}`;
            }
            return null;
        });

        this.validationRules.set('content_length', (content) => {
            if (!content || typeof content !== 'string') {
                return 'Content must be a string';
            }
            if (content.length < this.config.minContentLength) {
                return `Content too short (minimum ${this.config.minContentLength} characters)`;
            }
            if (content.length > this.config.maxContentLength) {
                return `Content too long (maximum ${this.config.maxContentLength} characters)`;
            }
            return null;
        });

        // アクセシビリティルール
        this.accessibilityRules.set('alt_text', (content) => {
            if (content.includes('<img') && !content.includes('alt=')) {
                return 'Images should have alt text for accessibility';
            }
            return null;
        });

        this.accessibilityRules.set('heading_structure', (content) => {
            const headingMatches = content.match(/<h[1-6]/g);
            if (headingMatches && headingMatches.length > 0) {
                // 見出し構造の簡単なチェック
                const levels = headingMatches.map(h => parseInt(h.charAt(2)));
                for (let i = 1; i < levels.length; i++) {
                    if (levels[i] - levels[i-1] > 1) {
                        return 'Heading levels should not skip (e.g., h1 to h3)';
                    }
                }
            }
            return null;
        });

        // 品質ルール
        this.qualityRules.set('readability', (content) => {
            // 簡単な読みやすさチェック
            const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
            const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
            
            if (avgSentenceLength > 100) {
                return 'Consider shorter sentences for better readability';
            }
            return null;
        });
    }

    /**
     * 基本構造のバリデーション
     * @param {Object} content - コンテンツ
     * @param {Object} result - 結果オブジェクト
     */
    validateBasicStructure(content, result) {
        if (!content || typeof content !== 'object') {
            result.errors.push('Content must be an object');
            return;
        }

        if (Array.isArray(content)) {
            result.errors.push('Content should not be an array');
            return;
        }
    }

    /**
     * 必須フィールドのバリデーション
     * @param {Object} content - コンテンツ
     * @param {Object} result - 結果オブジェクト
     * @param {Array} requiredFields - 必須フィールド配列
     */
    validateRequiredFields(content, result, requiredFields = null) {
        const fields = requiredFields || this.config.requiredFields;
        const rule = this.validationRules.get('required_fields');
        const error = rule(content, fields);
        
        if (error) {
            result.errors.push(error);
        }
    }

    /**
     * コンテンツ品質のバリデーション
     * @param {Object} content - コンテンツ
     * @param {Object} result - 結果オブジェクト
     */
    validateContentQuality(content, result) {
        // 言語コードチェック
        const langRule = this.validationRules.get('language_code');
        const langError = langRule(content.language);
        if (langError) {
            result.errors.push(langError);
        }

        // タイトル長チェック
        if (content.title && content.title.length > this.config.maxTitleLength) {
            result.warnings.push(`Title is quite long (${content.title.length} characters)`);
        }

        // コンテンツ長チェック
        if (content.content) {
            const contentRule = this.validationRules.get('content_length');
            const contentError = contentRule(content.content);
            if (contentError) {
                result.errors.push(contentError);
            }
        }

        // タグ数チェック
        if (content.tags && content.tags.length > this.config.maxTagsCount) {
            result.warnings.push(`Too many tags (${content.tags.length}, recommended: ${this.config.maxTagsCount})`);
        }

        // 難易度チェック
        if (content.difficulty && !this.config.supportedDifficulties.includes(content.difficulty)) {
            result.warnings.push(`Unknown difficulty level: ${content.difficulty}`);
        }
    }

    /**
     * セクション構造のバリデーション
     * @param {Array} sections - セクション配列
     * @param {Object} result - 結果オブジェクト
     */
    validateSections(sections, result) {
        if (!Array.isArray(sections)) {
            result.errors.push('Sections must be an array');
            return;
        }

        const sectionIds = new Set();
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const sectionPrefix = `Section ${i + 1}`;
            
            // セクションID重複チェック
            if (section.id) {
                if (sectionIds.has(section.id)) {
                    result.errors.push(`${sectionPrefix}: Duplicate section ID: ${section.id}`);
                } else {
                    sectionIds.add(section.id);
                }
            } else {
                result.errors.push(`${sectionPrefix}: Missing section ID`);
            }
            
            // セクション必須フィールド
            if (!section.title) {
                result.errors.push(`${sectionPrefix}: Missing title`);
            }
            
            if (!section.content) {
                result.errors.push(`${sectionPrefix}: Missing content`);
            }
            
            // セクション内容の品質チェック
            if (section.content) {
                const contentRule = this.validationRules.get('content_length');
                const contentError = contentRule(section.content);
                if (contentError) {
                    result.warnings.push(`${sectionPrefix}: ${contentError}`);
                }
            }
        }
    }

    /**
     * メタデータのバリデーション
     * @param {Object} content - コンテンツ
     * @param {Object} result - 結果オブジェクト
     */
    validateMetadata(content, result) {
        // バージョン形式チェック
        if (content.version && !/^\d+\.\d+\.\d+$/.test(content.version)) {
            result.warnings.push('Version should follow semantic versioning (e.g., 1.0.0)');
        }

        // 最終更新日チェック
        if (content.lastUpdated) {
            const date = new Date(content.lastUpdated);
            if (isNaN(date.getTime())) {
                result.warnings.push('Invalid lastUpdated date format');
            } else if (date > new Date()) {
                result.warnings.push('lastUpdated date is in the future');
            }
        }

        // 関連トピック数チェック
        if (content.relatedTopics && content.relatedTopics.length > this.config.maxRelatedTopics) {
            result.suggestions.push(`Consider reducing related topics count (current: ${content.relatedTopics.length})`);
        }
    }

    /**
     * アクセシビリティのバリデーション
     * @param {Object} content - コンテンツ
     * @param {Object} result - 結果オブジェクト
     */
    validateAccessibility(content, result) {
        if (content.content) {
            // 画像のalt属性チェック
            const altRule = this.accessibilityRules.get('alt_text');
            const altWarning = altRule(content.content);
            if (altWarning) {
                result.warnings.push(altWarning);
            }

            // 見出し構造チェック
            const headingRule = this.accessibilityRules.get('heading_structure');
            const headingWarning = headingRule(content.content);
            if (headingWarning) {
                result.warnings.push(headingWarning);
            }

            // 読みやすさチェック
            const readabilityRule = this.qualityRules.get('readability');
            const readabilityWarning = readabilityRule(content.content);
            if (readabilityWarning) {
                result.suggestions.push(readabilityWarning);
            }
        }
    }

    /**
     * チュートリアルステップのバリデーション
     * @param {Array} steps - ステップ配列
     * @param {Object} result - 結果オブジェクト
     */
    validateTutorialSteps(steps, result) {
        if (steps.length === 0) {
            result.errors.push('Tutorial must have at least one step');
            return;
        }

        const stepIds = new Set();
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepPrefix = `Step ${i + 1}`;
            
            // ステップID重複チェック
            if (step.id) {
                if (stepIds.has(step.id)) {
                    result.errors.push(`${stepPrefix}: Duplicate step ID: ${step.id}`);
                } else {
                    stepIds.add(step.id);
                }
            } else {
                result.errors.push(`${stepPrefix}: Missing step ID`);
            }
            
            // ステップ必須フィールド
            if (!step.title) {
                result.errors.push(`${stepPrefix}: Missing title`);
            }
            
            if (!step.instructions) {
                result.errors.push(`${stepPrefix}: Missing instructions`);
            }
            
            // ターゲット要素の妥当性
            if (step.targetElement && typeof step.targetElement !== 'string') {
                result.warnings.push(`${stepPrefix}: targetElement should be a CSS selector string`);
            }
            
            // スキップ許可の妥当性
            if (step.skipAllowed !== undefined && typeof step.skipAllowed !== 'boolean') {
                result.warnings.push(`${stepPrefix}: skipAllowed should be a boolean`);
            }
        }
    }

    /**
     * 推定時間のバリデーション
     * @param {Object} tutorial - チュートリアル
     * @param {Object} result - 結果オブジェクト
     */
    validateEstimatedDuration(tutorial, result) {
        if (tutorial.estimatedDuration !== undefined) {
            if (typeof tutorial.estimatedDuration !== 'number') {
                result.errors.push('estimatedDuration must be a number');
            } else if (tutorial.estimatedDuration < 0) {
                result.errors.push('estimatedDuration cannot be negative');
            } else if (tutorial.estimatedDuration > 3600000) { // 1時間以上
                result.warnings.push('Tutorial duration is quite long (over 1 hour)');
            }
        }
    }

    /**
     * 前提条件のバリデーション
     * @param {Object} tutorial - チュートリアル
     * @param {Object} result - 結果オブジェクト
     */
    validatePrerequisites(tutorial, result) {
        if (tutorial.prerequisites) {
            if (!Array.isArray(tutorial.prerequisites)) {
                result.errors.push('prerequisites must be an array');
            } else {
                for (const prereq of tutorial.prerequisites) {
                    if (typeof prereq !== 'string' || prereq.trim() === '') {
                        result.warnings.push('Invalid prerequisite ID found');
                    }
                }
            }
        }
    }

    /**
     * 質問と回答のバリデーション
     * @param {Object} faq - FAQ
     * @param {Object} result - 結果オブジェクト
     */
    validateQuestionAnswer(faq, result) {
        if (faq.question) {
            if (faq.question.length < 5) {
                result.warnings.push('Question is very short');
            }
            if (!faq.question.includes('?') && !faq.question.includes('？')) {
                result.suggestions.push('Consider adding a question mark to the question');
            }
        }

        if (faq.answer) {
            if (faq.answer.length < 10) {
                result.warnings.push('Answer is very short');
            }
            if (faq.answer === faq.question) {
                result.errors.push('Answer cannot be the same as question');
            }
        }
    }

    /**
     * 投票データのバリデーション
     * @param {Object} faq - FAQ
     * @param {Object} result - 結果オブジェクト
     */
    validateVotingData(faq, result) {
        if (faq.helpfulVotes !== undefined || faq.totalVotes !== undefined) {
            if (typeof faq.helpfulVotes !== 'number' || typeof faq.totalVotes !== 'number') {
                result.errors.push('Vote counts must be numbers');
            } else if (faq.helpfulVotes < 0 || faq.totalVotes < 0) {
                result.errors.push('Vote counts cannot be negative');
            } else if (faq.helpfulVotes > faq.totalVotes) {
                result.errors.push('Helpful votes cannot exceed total votes');
            }
        }
    }

    /**
     * 関連質問のバリデーション
     * @param {Object} faq - FAQ
     * @param {Object} result - 結果オブジェクト
     */
    validateRelatedQuestions(faq, result) {
        if (faq.relatedQuestions) {
            if (!Array.isArray(faq.relatedQuestions)) {
                result.errors.push('relatedQuestions must be an array');
            } else {
                for (const relatedId of faq.relatedQuestions) {
                    if (typeof relatedId !== 'string' || relatedId.trim() === '') {
                        result.warnings.push('Invalid related question ID found');
                    }
                    if (relatedId === faq.id) {
                        result.errors.push('FAQ cannot reference itself as related');
                    }
                }
            }
        }
    }

    /**
     * 言語間一貫性のチェック
     * @param {Map} languageMap - 言語別コンテンツマップ
     * @param {Object} result - 結果オブジェクト
     */
    checkLanguageConsistency(languageMap, result) {
        const languages = Array.from(languageMap.keys());
        
        if (languages.length < 2) {
            return; // 言語が1つしかない場合はスキップ
        }

        // 基準言語（最もコンテンツが多い言語）を決定
        let baseLang = languages[0];
        let maxCount = languageMap.get(baseLang).length;
        
        for (const lang of languages) {
            const count = languageMap.get(lang).length;
            if (count > maxCount) {
                baseLang = lang;
                maxCount = count;
            }
        }

        const baseContent = languageMap.get(baseLang);
        const baseIds = new Set(baseContent.map(c => c.id));

        // 他の言語との比較
        for (const lang of languages) {
            if (lang === baseLang) continue;
            
            const langContent = languageMap.get(lang);
            const langIds = new Set(langContent.map(c => c.id));
            
            // 不足しているコンテンツID
            const missingIds = [...baseIds].filter(id => !langIds.has(id));
            if (missingIds.length > 0) {
                result.issues.push(`Language ${lang} is missing content IDs: ${missingIds.join(', ')}`);
            }
            
            // 余分なコンテンツID
            const extraIds = [...langIds].filter(id => !baseIds.has(id));
            if (extraIds.length > 0) {
                result.issues.push(`Language ${lang} has extra content IDs: ${extraIds.join(', ')}`);
            }
        }
    }

    /**
     * カテゴリ間一貫性のチェック
     * @param {Map} categoryMap - カテゴリ別コンテンツマップ
     * @param {Object} result - 結果オブジェクト
     */
    checkCategoryConsistency(categoryMap, result) {
        // カテゴリ分布のバランスチェック
        const categories = Array.from(categoryMap.keys());
        const categoryCounts = categories.map(cat => categoryMap.get(cat).length);
        
        const maxCount = Math.max(...categoryCounts);
        const minCount = Math.min(...categoryCounts);
        
        if (maxCount > minCount * 5) { // 5倍以上の差がある場合
            result.issues.push(`Unbalanced category distribution (max: ${maxCount}, min: ${minCount})`);
        }
    }

    /**
     * 品質スコアの計算
     * @param {Object} result - バリデーション結果
     * @returns {number} 品質スコア（0-100）
     */
    calculateQualityScore(result) {
        let score = 100;
        
        // エラーによる減点
        score -= result.errors.length * 20;
        
        // 警告による減点
        score -= result.warnings.length * 5;
        
        // 提案による軽微な減点
        score -= result.suggestions.length * 1;
        
        return Math.max(0, score);
    }
}

// シングルトンインスタンス管理
let contentValidationInstance = null;

/**
 * ContentValidationのシングルトンインスタンスを取得
 * @returns {ContentValidation} ContentValidationインスタンス
 */
export function getContentValidation() {
    if (!contentValidationInstance) {
        contentValidationInstance = new ContentValidation();
    }
    return contentValidationInstance;
}

/**
 * ContentValidationインスタンスを再初期化
 * @returns {ContentValidation} 新しいContentValidationインスタンス
 */
export function reinitializeContentValidation() {
    contentValidationInstance = new ContentValidation();
    return contentValidationInstance;
}