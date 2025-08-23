import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// 型定義
export interface PluralRule {
    categories: string[];
    rules: Record<string, (n: number) => boolean>;
    examples: Record<string, number[]>;
}

export interface ContextualPattern {
    levels?: string[];
    categories?: string[];
    rules: Record<string, Record<string, string>>;
}

export interface GenerationPattern {
    condition: (data: any) => boolean;
    generate: (data: any, lang: string) => string;
}

export interface GenerationRule {
    patterns: GenerationPattern[];
}

export interface TranslationMemoryEntry {
    translation: string;
    original: string;
    timestamp: number;
    usage: number;
}

export interface MemoryConfig {
    maxEntries: number;
    expirationTime: number;
    similarityThreshold: number;
}

export interface FormatOptions {
    context?: string | null;
    forcePlural?: boolean;
    customRules?: any;
    fallbackContext?: string;
    parameters?: Record<string, any>;
    dynamicContext?: any;
    templateOverride?: string | null;
    cacheResult?: boolean;
    nestedLevel?: number;
    maxNestingLevel?: number;
    customProcessors?: Map<string, Function>;
}

export interface SearchOptions {
    maxResults?: number;
    minSimilarity?: number;
    includeExpired?: boolean;
}

export interface SearchResult {
    similarity: number;
    original: string;
    translation: string;
    key: string;
    timestamp: number;
    usage: number;
}

export interface FormatterStats {
    pluralizations: number;
    contextualTranslations: number;
    dynamicGenerations: number;
    memoryHits: number;
    memoryMisses: number;
    memorySize: number;
    memoryConfig: MemoryConfig;
    supportedLanguages: string[];
    contextualPatterns: number;
    generationRules: number;
    hitRate: string;
}

/**
 * 高度なフォーマット機能 - 複雑な複数形ルール、文脈依存翻訳、動的翻訳生成
 */
export class AdvancedFormatterEngine {
    private pluralRules: Map<string, PluralRule>;
    private contextualPatterns: Map<string, ContextualPattern>;
    private generationRules: Map<string, GenerationRule>;
    private translationMemory: Map<string, TranslationMemoryEntry>;
    private memoryConfig: MemoryConfig;
    private statistics: {
        pluralizations: number;
        contextualTranslations: number;
        dynamicGenerations: number;
        memoryHits: number;
        memoryMisses: number;
    };

    constructor() {
        // 複数形ルールを初期化
        this.pluralRules = new Map<string, PluralRule>([
            // 日本語
            ['ja', {
                categories: ['other'],
                rules: {
                    other: () => true
                },
                examples: { other: [0, 1, 2, 5, 10, 100] }
            }],
            // 英語
            ['en', {
                categories: ['one', 'other'],
                rules: {
                    one: (n) => n === 1 && n % 1 === 0,
                    other: (n) => true
                },
                examples: { 
                    one: [1],
                    other: [0, 2, 3, 10, 100] 
                }
            }],
            // アラビア語（6つのカテゴリ）
            ['ar', {
                categories: ['zero', 'one', 'two', 'few', 'many', 'other'],
                rules: {
                    zero: (n) => n === 0,
                    one: (n) => n === 1,
                    two: (n) => n === 2,
                    few: (n) => n % 100 >= 3 && n % 100 <= 10,
                    many: (n) => n % 100 >= 11 && n % 100 <= 99,
                    other: (n) => true
                },
                examples: {
                    zero: [0],
                    one: [1],
                    two: [2],
                    few: [3, 4, 5, 6, 7, 8, 9, 10, 103, 104],
                    many: [11, 12, 13, 99, 111, 112],
                    other: [100, 101, 102, 200, 1000]
                }
            }],
            // 中国語（複数形なし）
            ['zh', {
                categories: ['other'],
                rules: {
                    other: () => true
                },
                examples: { other: [0, 1, 2, 5, 10, 100] }
            }],
            // 韓国語（複数形なし）
            ['ko', {
                categories: ['other'],
                rules: {
                    other: () => true
                },
                examples: { other: [0, 1, 2, 5, 10, 100] }
            }],
            // ロシア語（複雑な複数形）
            ['ru', {
                categories: ['one', 'few', 'many', 'other'],
                rules: {
                    one: (n) => n % 10 === 1 && n % 100 !== 11,
                    few: (n) => n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20),
                    many: (n) => n % 10 === 0 || (n % 10 >= 5 && n % 10 <= 9) || (n % 100 >= 11 && n % 100 <= 14),
                    other: () => true
                },
                examples: {
                    one: [1, 21, 31, 41, 51, 61],
                    few: [2, 3, 4, 22, 23, 24, 32, 33],
                    many: [0, 5, 6, 7, 8, 9, 10, 11, 12],
                    other: []
                }
            }]
        ]);

        // 文脈依存翻訳パターン
        this.contextualPatterns = new Map<string, ContextualPattern>([
            // 敬語レベル（日本語）
            ['ja-politeness', {
                levels: ['casual', 'polite', 'formal', 'honorific'],
                rules: {
                    'greeting.hello': {
                        casual: 'やあ',
                        polite: 'こんにちは',
                        formal: 'お疲れ様です',
                        honorific: 'いらっしゃいませ'
                    },
                    'action.do': {
                        casual: 'する',
                        polite: 'します',
                        formal: 'いたします',
                        honorific: 'なさいます'
                    }
                }
            }],
            // 親密度レベル（韓国語）
            ['ko-intimacy', {
                levels: ['formal', 'polite', 'intimate', 'casual'],
                rules: {
                    'greeting.hello': {
                        formal: '안녕하십니까',
                        polite: '안녕하세요',
                        intimate: '안녕',
                        casual: '야'
                    },
                    'question.how': {
                        formal: '어떻게 하십니까',
                        polite: '어떻게 해요',
                        intimate: '어떻게 해',
                        casual: '어떻게'
                    }
                }
            }],
            // 性別依存（アラビア語）
            ['ar-gender', {
                categories: ['masculine', 'feminine'],
                rules: {
                    'adjective.good': {
                        masculine: 'جيد',
                        feminine: 'جيدة'
                    },
                    'verb.went': {
                        masculine: 'ذهب',
                        feminine: 'ذهبت'
                    }
                }
            }]
        ]);
        
        // 動的翻訳生成ルール
        this.generationRules = new Map<string, GenerationRule>([
            // 数値表現の生成
            ['number-expression', {
                patterns: [
                    {
                        condition: (n: number) => n >= 1000000,
                        generate: (n: number, lang: string) => this.generateLargeNumberExpression(n, lang)
                    },
                    {
                        condition: (n: number) => n >= 1000,
                        generate: (n: number, lang: string) => this.generateThousandExpression(n, lang)
                    }
                ]
            }],
            // 時間表現の生成
            ['time-expression', {
                patterns: [
                    {
                        condition: (time: string) => time.includes('ago'),
                        generate: (time: string, lang: string) => this.generateRelativeTimeExpression(time, lang)
                    },
                    {
                        condition: (time: string) => time.includes('in'),
                        generate: (time: string, lang: string) => this.generateFutureTimeExpression(time, lang)
                    }
                ]
            }],
            // 比較表現の生成
            ['comparison-expression', {
                patterns: [
                    {
                        condition: (data: any) => data.type === 'comparative',
                        generate: (data: any, lang: string) => this.generateComparativeExpression(data, lang)
                    },
                    {
                        condition: (data: any) => data.type === 'superlative',
                        generate: (data: any, lang: string) => this.generateSuperlativeExpression(data, lang)
                    }
                ]
            }]
        ]);
        
        // 翻訳メモリ
        this.translationMemory = new Map<string, TranslationMemoryEntry>();
        this.memoryConfig = {
            maxEntries: 10000,
            expirationTime: 24 * 60 * 60 * 1000, // 24時間
            similarityThreshold: 0.8
        };

        // 統計データ
        this.statistics = {
            pluralizations: 0,
            contextualTranslations: 0,
            dynamicGenerations: 0,
            memoryHits: 0,
            memoryMisses: 0
        };

        console.log('AdvancedFormatterEngine initialized');
    }
    
    /**
     * 高度な複数形処理
     */
    formatPlural(key: string, count: number, language: string, options: FormatOptions = {}): string {
        try {
            const { context = null, forcePlural = false, customRules = null } = options;
            
            // メモリチェック
            const memoryKey = `plural:${key}:${count}:${language}:${context}`;
            const cached = this.getFromMemory(memoryKey);
            if (cached) {
                this.statistics.memoryHits++;
                return cached;
            }

            // 複数形ルールを取得
            const pluralRule = customRules || this.pluralRules.get(language) || this.pluralRules.get('en')!;
            
            // 適切なカテゴリを決定
            const category = this.determinePluralCategory(count, pluralRule, forcePlural);
            
            // 翻訳キーを構築
            const translationKey = context ? `${key}.${context}.${category}` : `${key}.${category}`;
            
            // 基本翻訳を取得（実際の実装では翻訳システムから取得）
            let translation = this.getBaseTranslation(translationKey, language);
            
            // プレースホルダーを置換
            translation = this.replacePlaceholders(translation, {
                count: count,
                category: category,
                language: language
            });

            // 結果をメモリに保存
            this.saveToMemory(memoryKey, translation);
            this.statistics.pluralizations++;
            
            return translation;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PLURAL_FORMATTING_ERROR', {
                key: key,
                count: count,
                language: language
            });
            return `${key}[${count}]`;
        }
    }

    /**
     * 文脈依存翻訳
     */
    formatContextual(key: string, context: string, language: string, options: FormatOptions = {}): string {
        try {
            const {
                fallbackContext = 'default',
                parameters = {},
                dynamicContext = null
            } = options;
            
            // メモリチェック
            const memoryKey = `contextual:${key}:${JSON.stringify(context)}:${language}`;
            const cached = this.getFromMemory(memoryKey);
            if (cached) {
                this.statistics.memoryHits++;
                return cached;
            }

            // 動的コンテキスト解析
            const resolvedContext = dynamicContext ? 
                this.resolveDynamicContext(dynamicContext, parameters) : context;
            
            // 文脈パターンを取得
            const contextPattern = this.getContextualPattern(language, key);
            
            let translation: string;
            if (contextPattern && contextPattern[resolvedContext]) {
                // 文脈固有の翻訳を使用
                translation = contextPattern[resolvedContext];
            } else if (contextPattern && contextPattern[fallbackContext]) {
                // フォールバック翻訳を使用
                translation = contextPattern[fallbackContext];
            } else {
                // 基本翻訳を使用
                translation = this.getBaseTranslation(key, language);
            }

            // パラメータを置換
            translation = this.replacePlaceholders(translation, {
                ...parameters,
                context: resolvedContext,
                language: language
            });

            // 結果をメモリに保存
            this.saveToMemory(memoryKey, translation);
            this.statistics.contextualTranslations++;
            
            return translation;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'CONTEXTUAL_FORMATTING_ERROR', {
                key: key,
                context: context,
                language: language
            });
            return `${key}[${JSON.stringify(context)}]`;
        }
    }

    /**
     * 動的翻訳生成
     */
    generateDynamicTranslation(type: string, data: any, language: string, options: FormatOptions = {}): string {
        try {
            const {
                templateOverride = null,
                customRules = null,
                cacheResult = true
            } = options;
            
            // メモリチェック
            if (cacheResult) {
                const memoryKey = `dynamic:${type}:${JSON.stringify(data)}:${language}`;
                const cached = this.getFromMemory(memoryKey);
                if (cached) {
                    this.statistics.memoryHits++;
                    return cached;
                }
            }
            
            // 生成ルールを取得
            const generationRule = customRules || this.generationRules.get(type);
            if (!generationRule) {
                throw new Error(`No generation rule found for type: ${type}`);
            }
            
            // 適用可能なパターンを検索
            const applicablePattern = generationRule.patterns.find(pattern =>
                pattern.condition(data)
            );
            
            if (!applicablePattern) {
                throw new Error(`No applicable pattern found for data: ${JSON.stringify(data)}`);
            }
            
            // 翻訳を生成
            let translation = applicablePattern.generate(data, language);
            
            // テンプレートオーバーライドを適用
            if (templateOverride) {
                translation = this.applyTemplate(translation, templateOverride, data);
            }

            // 後処理
            translation = this.postProcessGeneration(translation, type, language);
            
            // 結果をメモリに保存
            if (cacheResult) {
                const memoryKey = `dynamic:${type}:${JSON.stringify(data)}:${language}`;
                this.saveToMemory(memoryKey, translation);
            }
            
            this.statistics.dynamicGenerations++;
            return translation;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'DYNAMIC_GENERATION_ERROR', {
                type: type,
                data: data,
                language: language
            });
            return `[${type}:${JSON.stringify(data)}]`;
        }
    }

    /**
     * 翻訳メモリ検索
     */
    searchTranslationMemory(query: string, language: string, options: SearchOptions = {}): SearchResult[] {
        const {
            maxResults = 10,
            minSimilarity = this.memoryConfig.similarityThreshold,
            includeExpired = false
        } = options;
        
        const results: SearchResult[] = [];
        const currentTime = Date.now();
        
        for (const [key, entry] of this.translationMemory) {
            // 期限チェック
            if (!includeExpired && 
                currentTime - entry.timestamp > this.memoryConfig.expirationTime) {
                continue;
            }

            // 言語フィルター
            if (!key.includes(language)) continue;

            // 類似度計算
            const similarity = this.calculateSimilarity(query, entry.original);
            if (similarity >= minSimilarity) {
                results.push({
                    similarity: similarity,
                    original: entry.original,
                    translation: entry.translation,
                    key: key,
                    timestamp: entry.timestamp,
                    usage: entry.usage || 0
                });
            }
        }
        
        // 類似度で降順ソート
        results.sort((a, b) => b.similarity - a.similarity);
        
        return results.slice(0, maxResults);
    }
    
    /**
     * 複合フォーマット処理
     */
    formatComplex(pattern: string, data: Record<string, any>, language: string, options: FormatOptions = {}): string {
        try {
            const {
                nestedLevel = 0,
                maxNestingLevel = 5,
                customProcessors = new Map()
            } = options;

            // 無限再帰防止
            if (nestedLevel > maxNestingLevel) {
                throw new Error('Maximum nesting level exceeded');
            }

            let result = pattern;
            
            // 複数形パターンを処理
            result = result.replace(/\{(\w+),\s*plural,\s*([^}]+)\}/g, (match, variable, pluralDef) => {
                const count = data[variable];
                if (typeof count === 'number') {
                    return this.formatPlural(pluralDef, count, language);
                }
                return match;
            });
            
            // 文脈依存パターンを処理
            result = result.replace(/\{(\w+),\s*select,\s*([^}]+)\}/g, (match, variable, selectDef) => {
                const value = data[variable];
                return this.formatContextual(selectDef, value, language);
            });
            
            // 日付・時刻パターンを処理
            result = result.replace(/\{(\w+),\s*(date|time|datetime),\s*([^}]+)\}/g, (match, variable, type, format) => {
                const dateValue = data[variable];
                if (dateValue) {
                    return this.formatDateTime(dateValue, format, language);
                }
                return match;
            });

            // 数値パターンを処理
            result = result.replace(/\{(\w+),\s*number,\s*([^}]+)\}/g, (match, variable, format) => {
                const numberValue = data[variable];
                if (typeof numberValue === 'number') {
                    return this.formatNumber(numberValue, format, language);
                }
                return match;
            });
            
            // カスタムプロセッサを処理
            for (const [processorName, processor] of customProcessors) {
                const regex = new RegExp(`\\{(\\w+),\\s*${processorName},\\s*([^}]+)\\}`, 'g');
                result = result.replace(regex, (match, variable, processorDef) => {
                    const value = data[variable];
                    return processor(value, processorDef, language, {
                        ...options,
                        nestedLevel: nestedLevel + 1
                    });
                });
            }
            
            // 基本的な変数置換
            result = result.replace(/\{(\w+)\}/g, (match, variable) => {
                return data[variable] !== undefined ? data[variable] : match;
            });
            
            return result;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'COMPLEX_FORMAT_ERROR', {
                pattern: pattern,
                language: language
            });
            return pattern;
        }
    }

    /**
     * ヘルパー関数群
     */

    private determinePluralCategory(count: number, pluralRule: PluralRule, forcePlural: boolean): string {
        if (!pluralRule || !pluralRule.rules) {
            return 'other';
        }

        // 強制複数形の場合
        if (forcePlural && count !== 1) {
            return pluralRule.categories.includes('other') ? 'other' : pluralRule.categories[pluralRule.categories.length - 1];
        }

        // ルールに基づいてカテゴリを決定
        for (const category of pluralRule.categories) {
            if (pluralRule.rules[category] && pluralRule.rules[category](count)) {
                return category;
            }
        }

        return 'other';
    }
    
    private getContextualPattern(language: string, key: string): Record<string, string> | null {
        // 言語固有のパターンを検索
        for (const [patternKey, pattern] of this.contextualPatterns) {
            if (patternKey.startsWith(language) && pattern.rules[key]) {
                return pattern.rules[key];
            }
        }
        
        return null;
    }

    private resolveDynamicContext(dynamicContext: any, parameters: Record<string, any>): string {
        // 動的コンテキストの解決ロジック
        if (typeof dynamicContext === 'function') {
            return dynamicContext(parameters);
        }

        if (typeof dynamicContext === 'object') {
            // 条件に基づいてコンテキストを決定
            for (const [condition, context] of Object.entries(dynamicContext)) {
                if (this.evaluateCondition(condition, parameters)) {
                    return context as string;
                }
            }
        }

        return dynamicContext;
    }

    private evaluateCondition(condition: string, parameters: Record<string, any>): boolean {
        // 簡単な条件評価（実際の実装ではより高度な評価が必要）
        try {
            // 安全な評価のため、限定的な条件のみサポート
            if (condition.includes('age') && parameters.age !== undefined) {
                if (condition.includes('>=')) {
                    const threshold = parseInt(condition.split('>=')[1]);
                    return parameters.age >= threshold;
                }
                if (condition.includes('<=')) {
                    const threshold = parseInt(condition.split('<=')[1]);
                    return parameters.age <= threshold;
                }
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }
    
    private generateLargeNumberExpression(number: number, language: string): string {
        const millions = Math.floor(number / 1000000);
        const thousands = Math.floor((number % 1000000) / 1000);
        const hundreds = number % 1000;
        
        const parts: string[] = [];
        
        if (millions > 0) {
            parts.push(this.getNumberWord(millions, language) + ' ' + this.getUnitWord('million', language));
        }
        if (thousands > 0) {
            parts.push(this.getNumberWord(thousands, language) + ' ' + this.getUnitWord('thousand', language));
        }
        if (hundreds > 0) {
            parts.push(this.getNumberWord(hundreds, language));
        }

        return parts.join(' ');
    }
    
    private generateThousandExpression(number: number, language: string): string {
        const thousands = Math.floor(number / 1000);
        const remainder = number % 1000;

        let result = this.getNumberWord(thousands, language) + ' ' + this.getUnitWord('thousand', language);
        if (remainder > 0) {
            result += ' ' + this.getNumberWord(remainder, language);
        }
        return result;
    }
    
    private generateRelativeTimeExpression(time: string, lang: string): string {
        // 実装プレースホルダー
        return time;
    }

    private generateFutureTimeExpression(time: string, lang: string): string {
        // 実装プレースホルダー
        return time;
    }

    private generateComparativeExpression(data: any, lang: string): string {
        // 実装プレースホルダー
        return JSON.stringify(data);
    }

    private generateSuperlativeExpression(data: any, lang: string): string {
        // 実装プレースホルダー
        return JSON.stringify(data);
    }

    private applyTemplate(translation: string, template: string, data: any): string {
        // 実装プレースホルダー
        return translation;
    }

    private postProcessGeneration(translation: string, type: string, language: string): string {
        // 実装プレースホルダー
        return translation;
    }

    private formatDateTime(dateValue: any, format: string, language: string): string {
        // 実装プレースホルダー
        return dateValue.toString();
    }

    private formatNumber(numberValue: number, format: string, language: string): string {
        // 実装プレースホルダー
        return numberValue.toString();
    }

    private getNumberWord(number: number, language: string): string {
        // 簡略化した数値単語変換
        const numberWords: Record<string, Record<number, string>> = {
            ja: { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五' },
            en: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' },
            ar: { 1: 'واحد', 2: 'اثنان', 3: 'ثلاثة', 4: 'أربعة', 5: 'خمسة' }
        };
        
        return numberWords[language]?.[number] || number.toString();
    }

    private getUnitWord(unit: string, language: string): string {
        const unitWords: Record<string, Record<string, string>> = {
            ja: { thousand: '千', million: '百万' },
            en: { thousand: 'thousand', million: 'million' },
            ar: { thousand: 'ألف', million: 'مليون' }
        };
        
        return unitWords[language]?.[unit] || unit;
    }

    private replacePlaceholders(text: string, data: Record<string, any>): string {
        if (!text) return text;

        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    private getBaseTranslation(key: string, language: string): string {
        // モック実装 - 実際の実装では翻訳システムから取得
        const mockTranslations: Record<string, Record<string, string>> = {
            'item.one': { ja: '1つのアイテム', en: 'one item', ar: 'عنصر واحد' },
            'item.other': { ja: '{count}つのアイテム', en: '{count} items', ar: '{count} عناصر' }
        };
        
        return mockTranslations[key]?.[language] || key;
    }

    private calculateSimilarity(str1: string, str2: string): number {
        // Levenshtein距離ベースの類似度計算
        const matrix: number[][] = [];
        const len1 = str1.length;
        const len2 = str2.length;
        
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
    }
    
    private getFromMemory(key: string): string | null {
        const entry = this.translationMemory.get(key);
        if (!entry) {
            this.statistics.memoryMisses++;
            return null;
        }

        // 期限チェック
        if (Date.now() - entry.timestamp > this.memoryConfig.expirationTime) {
            this.translationMemory.delete(key);
            this.statistics.memoryMisses++;
            return null;
        }

        // 使用回数を増加
        entry.usage = (entry.usage || 0) + 1;
        return entry.translation;
    }
    
    private saveToMemory(key: string, translation: string, original: string | null = null): void {
        // メモリサイズ制限チェック
        if (this.translationMemory.size >= this.memoryConfig.maxEntries) {
            this.cleanupMemory();
        }

        this.translationMemory.set(key, {
            translation: translation,
            original: original || key,
            timestamp: Date.now(),
            usage: 1
        });
    }
    
    private cleanupMemory(): void {
        const entries = Array.from(this.translationMemory.entries());
        const currentTime = Date.now();

        // 期限切れエントリを削除
        const validEntries = entries.filter(([key, entry]) =>
            currentTime - entry.timestamp <= this.memoryConfig.expirationTime
        );
        
        // 使用頻度でソートして上位エントリのみ保持
        validEntries.sort((a, b) => (b[1].usage || 0) - (a[1].usage || 0));
        const keepCount = Math.floor(this.memoryConfig.maxEntries * 0.8);

        this.translationMemory.clear();
        validEntries.slice(0, keepCount).forEach(([key, entry]) => {
            this.translationMemory.set(key, entry);
        });
        
        console.log(`Translation memory cleaned up: ${validEntries.length} -> ${this.translationMemory.size}`);
    }
    
    /**
     * 公開API
     */
    
    /**
     * 複数形ルールを追加
     */
    addPluralRule(language: string, rule: PluralRule): void {
        this.pluralRules.set(language, rule);
        console.log(`Plural rule added for language: ${language}`);
    }
    
    /**
     * 文脈パターンを追加
     */
    addContextualPattern(key: string, pattern: ContextualPattern): void {
        this.contextualPatterns.set(key, pattern);
        console.log(`Contextual pattern added: ${key}`);
    }
    
    /**
     * 生成ルールを追加
     */
    addGenerationRule(type: string, rule: GenerationRule): void {
        this.generationRules.set(type, rule);
        console.log(`Generation rule added: ${type}`);
    }
    
    /**
     * メモリ設定を更新
     */
    updateMemoryConfig(config: Partial<MemoryConfig>): void {
        Object.assign(this.memoryConfig, config);
        console.log('Translation memory config updated:', config);
    }

    /**
     * メモリをクリア
     */
    clearMemory(): void {
        this.translationMemory.clear();
        console.log('Translation memory cleared');
    }

    /**
     * 統計情報を取得
     */
    getStats(): FormatterStats {
        return {
            ...this.statistics,
            memorySize: this.translationMemory.size,
            memoryConfig: this.memoryConfig,
            supportedLanguages: Array.from(this.pluralRules.keys()),
            contextualPatterns: this.contextualPatterns.size,
            generationRules: this.generationRules.size,
            hitRate: this.statistics.memoryHits + this.statistics.memoryMisses > 0 ?
                (this.statistics.memoryHits / (this.statistics.memoryHits + this.statistics.memoryMisses) * 100).toFixed(2) + '%' : '0%'
        };
    }
}

// シングルトンインスタンス
let advancedFormatterEngineInstance: AdvancedFormatterEngine | null = null;

/**
 * AdvancedFormatterEngineのシングルトンインスタンスを取得
 */
export function getAdvancedFormatterEngine(): AdvancedFormatterEngine {
    if (!advancedFormatterEngineInstance) {
        advancedFormatterEngineInstance = new AdvancedFormatterEngine();
    }
    return advancedFormatterEngineInstance;
}