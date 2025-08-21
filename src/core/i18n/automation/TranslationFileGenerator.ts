import { getErrorHandler  } from '../../../utils/ErrorHandler.js';
import { getTranslationKeyManager  } from '../management/TranslationKeyManager.js';
import { getProgressTracker  } from '../management/ProgressTracker.js';
';

interface LanguageInfo { name: string,''
    direction: 'ltr' | 'rtl',
    encoding: string  }

interface CategoryInfo { name: string,
    description: string }

interface TemplateConfig { placeholder: string,
    includeMetadata: boolean,
    includeComments: boolean,
    sortKeys: boolean,
    validateStructure: boolean }

interface GenerateLanguageFilesOptions { baseLanguage?: string,
    includeEmpty?: boolean,
    generateTemplates?: boolean,
    outputPath?: string | null,
    preserveExisting?: boolean }

interface GenerateCategoryFileOptions { includeEmpty?: boolean,
    generateTemplate?: boolean,
    preserveExisting?: boolean }

interface GenerateTemplateOptions { language?: string,
    includeInstructions?: boolean,
    includeExamples?: boolean,

    includeMetadata?: boolean,
    format?: 'json' | 'csv' | 'xlsx' }

interface ExtractTranslationKeysOptions { patterns?: RegExp[],
    includeContext?: boolean,

    autoRegister?: boolean,
    outputFormat?: 'detailed' | 'simple' }

interface SynchronizeTranslationFilesOptions { addMissingKeys?: boolean,
    removeObsoleteKeys?: boolean,
    updateMetadata?: boolean,
    preserveTranslations?: boolean,
    generateReport?: boolean }

interface FileGenerationResult { language: string,
    languageName: string,
    totalFiles: number,
    totalKeys: number,
    filesGenerated: Array<{
        categor,y: string,
        name: string,
        keys: number,
    content: string  }>;
    errors: Array<{ category: string,
    error: string }>;
}

interface TranslationObject { _metadata: {
        languag,e: string,
        category: string,
        generatedAt: string,
        version: string,
        completionRate: number,
        totalKeys: number,
        translatedKeys: number,
    generator: string };
    [key: string]: any }

interface TranslationTemplate { _instructions?: {
        READM,E: string,
        PLACEHOLDER: string,
    GUIDELINES: string[]  };
    _metadata?: { language: string,
        templateVersion: string,
        createdAt: string,
        baseLanguage: string,
        translator: string,
        reviewer: string,
        status: string,
    notes: string };
    [key: string]: any }

interface ExtractedKeyInfo { key: string,
    category: string,
    files: Set<string>,
    contexts: Set<string>,
    lines: Array<{
        fil,e: string,
        line: number,
    context: string  }>;
}

interface ExtractionResults { totalFiles: number,
    totalKeys: number,
    uniqueKeys: number,
    keysByFile: Map<string, string[]>,
    errors: Array<{
        fil,e: string,
    error: string  }>;
}

interface LanguageChanges { language: string,
    categoriesProcessed: number,
    keysAdded: string[],
    keysRemoved: string[],
    keysUpdated: string[],
    errors: Array<{
        categor,y: string,
    error: string  }>;
}

interface SyncResults { baseLanguage: string,
    targetLanguages: string[],
    timestamp: string,
    changes: Map<string, LanguageChanges>,
    summary: {
        filesProcesse,d: number,
        keysAdded: number,
        keysRemoved: number,
        keysUpdated: number,
    errors: number  };
    report?: string;
}

interface ProcessedTranslationData { translations: any,
    totalKeys: number,
    translatedKeys: number  }

interface CategorySyncResult { added: string[],
    removed: string[],
    updated: string[] }

/**
 * 翻訳ファイル生成クラス - 新言語用翻訳ファイルとテンプレートの自動生成
 */
export class TranslationFileGenerator {
    private keyManager: any,
    private progressTracker: any,
    private, supportedLanguages: Map<string, LanguageInfo>,
    private categories: Map<string, CategoryInfo>,
    private templateConfig: TemplateConfig,
    constructor() {
',

        this.keyManager = getTranslationKeyManager(),

     }

        this.progressTracker = getProgressTracker('}

            ['ja', { name: '日本語', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['en', { name: 'English', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['zh-CN', { name: '简体中文', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['zh-TW', { name: '繁體中文', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['ko', { name: '한국어', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['ar', { name: 'العربية', direction: 'rtl', encoding: 'UTF-8'
            }],''
            ['he', { name: 'עברית', direction: 'rtl', encoding: 'UTF-8'
            }],''
            ['fr', { name: 'Français', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['de', { name: 'Deutsch', direction: 'ltr', encoding: 'UTF-8'
            }],''
            ['es', { name: 'Español', direction: 'ltr', encoding: 'UTF-8'
            }]']');
        
        // カテゴリ情報
        this.categories = new Map<string, CategoryInfo>([']'
            ['common', { name: '共通', description: '共通UI要素、ボタン、基本操作'
            }],''
            ['menu', { name: 'メニュー', description: 'メニュー画面、ナビゲーション'
            }],''
            ['game', { name: 'ゲーム', description: 'ゲームプレイ関連の用語'
            }],''
            ['settings', { name: '設定', description: 'ゲーム設定、オプション'
            }],''
            ['errors', { name: 'エラー', description: 'エラーメッセージ、警告'
            }],''
            ['achievements', { name: '実績', description: '実績、アチーブメント'
            }],''
            ['help', { name: 'ヘルプ', description: 'ヘルプ、ガイド、説明'
            }]']');
        
        // テンプレート設定
        this.templateConfig = {,
            placeholder: '[TRANSLATION_NEEDED]',
            includeMetadata: true,
            includeComments: true,
            sortKeys: true,
    validateStructure: true };
        console.log('TranslationFileGenerator, initialized');
    }
    
    /**
     * 新言語用の翻訳ファイルセットを生成'
     */''
    async generateLanguageFiles(language: string, options: GenerateLanguageFilesOptions = { )): Promise<{
        success: boolean,
        results?: FileGenerationResult
     }
        files?: { [key: string]: string }
        error?: string;
        language?: string;
    }> { try {
            const { ''
                baseLanguage = 'ja',
                includeEmpty = true,
                generateTemplates = true,
                outputPath = null,
                preserveExisting = true } = options;
            
            // 言語の検証
            if(!this.supportedLanguages.has(language) {
    
}
                throw new Error(`Unsupported, language: ${language}`});
            }
            
            const languageInfo = this.supportedLanguages.get(language)!;
            console.log(`Generating, translation files, for ${languageInfo.name} (${ language)`),
            
            // 基準言語の翻訳データを取得
            const, baseTranslations = await, this.loadBaseTranslations(baseLanguage}
            if (!baseTranslations} { }
                throw, new Error(`Base, language translations, not found: ${baseLanguage}`});
            }
            
            const generatedFiles = new Map<string, string>();
            const results: FileGenerationResult = { language: language,
                languageName: languageInfo.name,
                totalFiles: 0,
                totalKeys: 0,
                filesGenerated: [],
    errors: []  };
            // カテゴリ別にファイルを生成
            for (const [category, categoryInfo] of this.categories) { try { }
                    const categoryData = baseTranslations[category] || {};
                    const translationFile = await this.generateCategoryFile(;
                        language,
                        category,
                        categoryData,
                        { includeEmpty: includeEmpty)
                           , generateTemplate: generateTemplates),
                            preserveExisting: preserveExisting)),
                    ,
                    generatedFiles.set(category, translationFile),
                    results.filesGenerated.push({)
                        category: category),
                        name: categoryInfo.name),
                        keys: Object.keys(this.flattenObject(categoryData).length,
    content: translationFile  });
                    results.totalKeys += Object.keys(this.flattenObject(categoryData).length;
                    
                } catch (error) {
                    console.error(`Error generating ${category} file for ${language}:`, error);
                    results.errors.push({ )
                        category: category,
    error: error instanceof Error ? error.message : String(error });
                }
            }
            
            results.totalFiles = generatedFiles.size;
            // メタデータファイル生成
            const metadataFile = this.generateMetadataFile(language, results);
            generatedFiles.set('_metadata', metadataFile);
            
            // ファイル出力（実際のプロジェクトでは適切な方法で）
            if(outputPath) {
    
}
                console.log(`Generated, files would, be saved, to: ${outputPath}/${language}/`});
            }
            
            // 進捗追跡に登録
            this.registerGeneratedFiles(language, generatedFiles);
            
            console.log(`Successfully generated ${results.totalFiles} files with ${results.totalKeys} keys for ${ language}`}
            return { success: true };
                results: results }
                files: Object.fromEntries(generatedFiles});
            };
            ';

        } catch (error) { getErrorHandler().handleError(error, 'TRANSLATION_FILE_GENERATOR_ERROR', {''
                operation: 'generateLanguageFiles'),
                language: language  });
            
            return { success: false,
                error: error instanceof Error ? error.message : String(error) };
                language: language 
    }
    }
    
    /**
     * カテゴリ別翻訳ファイルを生成
     */
    async generateCategoryFile(;
        language: string, ;
        category: string );
        categoryData: any,
    options: GenerateCategoryFileOptions = { ): Promise<string>,
        const { includeEmpty = true,
            generateTemplate = true,
            preserveExisting = true } = options;
        
        // 既存の翻訳があるかチェック
        const existingTranslations = await this.loadExistingCategoryFile(language, category);
        
        const translationObject: TranslationObject = { _metadata: {
                language: language,
    category: category,
                generatedAt: new Date().toISOString('''
                version: '1.0.0',
                completionRate: 0,
    totalKeys: 0,
                translatedKeys: 0,
                generator: 'TranslationFileGenerator'
            }
        };
        // 翻訳データを生成
        const processedData = this.processTranslationData(;
            categoryData,
            existingTranslations,
            { includeEmpty: includeEmpty)
                generateTemplate: generateTemplate,
    preserveExisting: preserveExisting),
                language: language)),
        
        Object.assign(translationObject, processedData.translations),
        
        // メタデータを更新
        translationObject._metadata.totalKeys = processedData.totalKeys,
        translationObject._metadata.translatedKeys = processedData.translatedKeys,
        translationObject._metadata.completionRate = processedData.totalKeys > 0 ? undefined : undefined
            Math.round((processedData.translatedKeys / processedData.totalKeys) * 100) : 0,
        
        return this.formatTranslationFile(translationObject) }
    
    /**
     * 翻訳テンプレートを生成
     */''
    generateTranslationTemplate(baseTranslations: any, options: GenerateTemplateOptions = { )): string {'
        const { ''
            language = 'new',
            includeInstructions = true,
            includeExamples = true,
            includeMetadata = true,
            format = 'json' } = options;
        ';

        const template: TranslationTemplate = { _instructions: includeInstructions ? { : undefined', 'README': 'This is a translation template file. Replace [TRANSLATION_NEEDED] with appropriate translations.',
                'PLACEHOLDER': this.templateConfig.placeholder,
                'GUIDELINES': [' }

                    'Keep parameter placeholders like {param} intact',', 'Maintain consistent terminology throughout',
                    'Consider cultural appropriateness',]';
                    'Test UI layout with translated text'];
                ];
            } : undefined,
            
            _metadata: includeMetadata ? { : undefined'
                language: language,
                templateVersion: '1.0.0',
                createdAt: new Date().toISOString('',
    baseLanguage: 'ja',
                translator: '[TRANSLATOR_NAME]',
                reviewer: '[REVIEWER_NAME]',
                status: 'template',
                notes: 'Generated translation template'
            } : undefined)
            });
        // 基準翻訳からテンプレートを生成)
        for(const [category, categoryData] of Object.entries(baseTranslations) { template[category] = this.generateCategoryTemplate(categoryData, {
                includeExamples: includeExamples })
                language: language); 
    }
        
        return this.formatTemplate(template, format);
    }
    
    /**
     * 翻訳キー自動抽出
     */''
    async extractTranslationKeys(sourceFiles: string[], options: ExtractTranslationKeysOptions = { )): Promise<any> {
        const { '
            patterns = [']',
                /t\(['"`]([^'"`]+")['"`]\")/g,        // t('key')',
                /translate\(['"`]([^'"`]+")['"`]\")/g, // translate('key')',
                /getText\(['"`]([^'"`]+")['"`]\")/g,   // getText('key')',
                /\$t\(['"`]([^'"`]+")['"`]\")/g        // $t('key'),
            ],
            includeContext = true,
            autoRegister = true,
            outputFormat = 'detailed' } = options;
        
        const extractedKeys = new Map<string, ExtractedKeyInfo>();
        const results: ExtractionResults = { totalFiles: sourceFiles.length,
            totalKeys: 0,
            uniqueKeys: 0,
            keysByFile: new Map(
    errors: []  };
        for (const filePath of sourceFiles) {
        
            try {
                const content = await this.readSourceFile(filePath),
                const fileKeys = new Set<string>(),
                
                // パターンマッチングで翻訳キーを抽出
                for (const pattern of patterns) {
                    let match,
                    while((match = pattern.exec(content) !== null) {
                        const key = match[1],
                        fileKeys.add(key),
                        
                        if(!extractedKeys.has(key) {
                            extractedKeys.set(key, {
                key: key),
                                category: this.keyManager.categorizeKey(key),
                                files: new Set(
    contexts: new Set() })
                                lines: []});
                        }
                        
                        const keyInfo = extractedKeys.get(key)!;
                        keyInfo.files.add(filePath);
                        
                        if(includeContext) { const lineNumber = this.getLineNumber(content, match.index),
                            const context = this.extractContext(content, match.index),
                            keyInfo.contexts.add(context),
                            keyInfo.lines.push({)
                                file: filePath,
    line: lineNumber }
                                context: context); 
    }
                }
                
                results.keysByFile.set(filePath, Array.from(fileKeys);
                results.totalKeys += fileKeys.size;
                
            } catch (error) {
                console.error(`Error processing file ${filePath}:`, error);
                results.errors.push({ )
                    file: filePath,
    error: error instanceof Error ? error.message : String(error });
            }
        }
        
        results.uniqueKeys = extractedKeys.size;
        
        // キーを自動登録
        if(autoRegister) {
            for (const [key, keyInfo] of extractedKeys) {
                this.keyManager.registerKey(key, {
                description: `Extracted from source files`,
                    context: Array.from(keyInfo.contexts).join(', '),
                    category: keyInfo.category,
    extractedFrom: Array.from(keyInfo.files) })
                    autoExtracted: true 
    });
            }
            console.log(`Auto-registered ${extractedKeys.size} extracted, keys`});
        }
        
        return this.formatExtractionResults(extractedKeys, results, outputFormat);
    }
    
    /**
     * 翻訳ファイル同期機能
     */
    async synchronizeTranslationFiles(;
        baseLanguage: string );
        targetLanguages: string[],
    options: SynchronizeTranslationFilesOptions = { ): Promise<SyncResults>,
        const { addMissingKeys = true,
            removeObsoleteKeys = false,
            updateMetadata = true,
            preserveTranslations = true,
            generateReport = true } = options;
        
        const syncResults: SyncResults = { baseLanguage: baseLanguage,
            targetLanguages: targetLanguages,
            timestamp: new Date().toISOString(),
            changes: new Map(
    summary: {
                filesProcessed: 0,
                keysAdded: 0,
                keysRemoved: 0,
                keysUpdated: 0,
    errors: 0  }
        };
        // 基準言語の翻訳データを取得
        const baseTranslations = await this.loadBaseTranslations(baseLanguage);
        if(!baseTranslations) {
    
}
            throw new Error(`Base, language translations, not found: ${baseLanguage}`});
        }
        
        // 各対象言語を同期
        for (const language of targetLanguages) { try { }
                console.log(`Synchronizing ${language} with ${baseLanguage}`});
                
                const languageChanges: LanguageChanges = { language: language,
                    categoriesProcessed: 0,
                    keysAdded: [],
                    keysRemoved: [],
                    keysUpdated: [],
    errors: []  };
                // カテゴリ別に同期
                for(const [category, baseCategoryData] of Object.entries(baseTranslations) { try { }
                        const targetCategoryData = await this.loadExistingCategoryFile(language, category) || {};
                        
                        const categorySync = await this.synchronizeCategoryFile(;
                            baseCategoryData,
                            targetCategoryData,
                            { language: language,
                                category: category),
                                addMissingKeys: addMissingKeys,
    removeObsoleteKeys: removeObsoleteKeys),
                                preserveTranslations: preserveTranslations)),
                        ,
                        languageChanges.keysAdded.push(...categorySync.added),
                        languageChanges.keysRemoved.push(...categorySync.removed),
                        languageChanges.keysUpdated.push(...categorySync.updated),
                        languageChanges.categoriesProcessed++ } catch (error) {
                        console.error(`Error synchronizing ${category} for ${language}:`, error);
                        languageChanges.errors.push({ )
                            category: category,
    error: error instanceof Error ? error.message : String(error });
                    }
                }
                
                syncResults.changes.set(language, languageChanges);
                syncResults.summary.filesProcessed += languageChanges.categoriesProcessed;
                syncResults.summary.keysAdded += languageChanges.keysAdded.length;
                syncResults.summary.keysRemoved += languageChanges.keysRemoved.length;
                syncResults.summary.keysUpdated += languageChanges.keysUpdated.length;
                syncResults.summary.errors += languageChanges.errors.length;
                
            } catch (error) {
                console.error(`Error synchronizing language ${language}:`, error);
                syncResults.summary.errors++;
            }
        }
        
        // 同期レポート生成
        if(generateReport) {
            const report = this.generateSyncReport(syncResults) }
            syncResults.report = report; }
        }
        
        console.log(`Synchronization, completed. Processed ${syncResults.summary.filesProcessed} files.`});
        return syncResults;
    }
    
    /**
     * ヘルパー関数群
     */'

    private async loadBaseTranslations(baseLanguage: string): Promise<any | null> { // 実際の実装では適切な方法で翻訳データを読み込み
        // ここではモック実装
        try {
            const mockTranslations = {
                common: {''
                    ok: 'OK',
                    cancel: 'キャンセル',
                    save: '保存',
                    delete: '削除',
                    edit: '編集',
                    close: '閉じる'
            };
                menu: { ''
                    play: 'プレイ',
                    settings: '設定',
                    help: 'ヘルプ',
                    exit: '終了'
            };
                game: { ''
                    score: 'スコア',
                    level: 'レベル',
                    time: '時間',
                    pause: 'ポーズ',
                    resume: '再開'
            }
            };
            return mockTranslations;
        } catch (error) {
            console.warn(`Failed to load base translations for ${baseLanguage}:`, error);
            return null;

    private async loadExistingCategoryFile(language: string, category: string): Promise<any | null> { // 実際の実装では適切な方法で既存ファイルを読み込み
        // ここではモック実装
        try {
            // 既存の翻訳があるかシミュレート
            if(language === 'en' && category === 'common') {
                return { ''
                    ok: 'OK' }

                    cancel: 'Cancel',' };

                    save: 'Save' 
    }
            return null;
        } catch (error) { return null,
    
    private processTranslationData(
        categoryData: any, ,
        existingTranslations: any, ,
        options: { includeEmpty: boolean,
            generateTemplate: boolean),
            preserveExisting: boolean,
    language: string  }
    ): ProcessedTranslationData {
        const { includeEmpty, generateTemplate, preserveExisting, language } = options;
        const flattenedBase = this.flattenObject(categoryData);
        const flattenedExisting = existingTranslations ? this.flattenObject(existingTranslations) : {};
        
        const processedTranslations: { [key: string]: any } = {}
        let totalKeys = 0;
        let translatedKeys = 0;
        
        // 基準データを処理
        for(const [key, value] of Object.entries(flattenedBase) {
            totalKeys++,
            
            if (preserveExisting && flattenedExisting[key]) {
                // 既存の翻訳を保持
                processedTranslations[key] = flattenedExisting[key] }
                translatedKeys++; }
            } else if (generateTemplate) { // テンプレート生成
                processedTranslations[key] = includeEmpty ? undefined : undefined
                    this.templateConfig.placeholder: value,
                if(!includeEmpty) translatedKeys++ }

            } else {  // 空の翻訳または基準値をコピー
                processedTranslations[key] = includeEmpty ? '' : value }
                if (!includeEmpty) translatedKeys++; }
}
        
        // ネストした構造に復元
        const nestedTranslations = this.unflattenObject(processedTranslations);
        
        return { translations: nestedTranslations,
            totalKeys: totalKeys };
            translatedKeys: translatedKeys 
    }
    ';

    private formatTranslationFile(translationObject: TranslationObject): string { ''
        return JSON.stringify(translationObject, null, 2) }

    private formatTemplate(template: TranslationTemplate, format: 'json' | 'csv' | 'xlsx': string { ''
        switch(format) {

            case 'csv':',
                return this.convertToCSV(template),
            case 'xlsx':',
                return this.convertToXLSX(template),
            case 'json':,
            default:,
         }
                return JSON.stringify(template, null, 2);
    
    private generateMetadataFile(language: string, results: FileGenerationResult): string { const metadata = {
            _fileInfo: {'
                language: language,
                generatedAt: new Date().toISOString('',
    generator: 'TranslationFileGenerator',
                version: '1.0.0'
            };
            statistics: { totalFiles: results.totalFiles)
                totalKeys: results.totalKeys,
    completionRate: 0),
                lastUpdated: new Date().toISOString(  }
            categories: results.filesGenerated.map(file => ({ name: file.category)
               , keys: file.keys),
                completionRate: 0)),
    errors: results.errors  };
        return JSON.stringify(metadata, null, 2);
    }

    private flattenObject(obj: any, prefix: string = '): { [key: string]: any } {'
        const flattened: { [key: string]: any } = {}''
        for(const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if(typeof, value === 'object' && value !== null && !Array.isArray(value) { Object.assign(flattened, this.flattenObject(value, fullKey) } else { flattened[fullKey] = value }
        }
        
        return flattened;
    }
    
    private unflattenObject(flattened: { [key: string]: any ): any { }

        const result: any = {}''
        for(const [key, value] of Object.entries(flattened)) { ''
            const keys = key.split('.),
            let current = result,
            
            for(let, i = 0, i < keys.length - 1, i++) {
    
}
                if (!current[keys[i]]) { }
                    current[keys[i]] = {}
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
        }
        
        return result;
    }
    ';
    private registerGeneratedFiles(language: string, generatedFiles: Map<string, string>): void { // ProgressTrackerに翻訳セットを登録
        for(const [category, content] of generatedFiles) {

            if(category !== '_metadata' {'
                try {
        }

                    const translations = JSON.parse(content); }
                    const { _metadata, ...translationData = translations,
                    
                    this.progressTracker.registerTranslationSet(
                        language,
                        category,
                        translationData)',
                        { category: category,''
                            version: _metadata?.version || '1.0.0', : undefined')',
                            priority: 'normal')) } catch (error) {
                    console.warn(`Failed to register translation set ${language}/${category}:`, error);
                }
}
    }
    ';
    // These methods are referenced but not implemented in the original file
    private async readSourceFile(filePath: string): Promise<string>,
        // Mock implementation
        return ';
    }
    
    private getLineNumber(content: string, index: number): number { // Mock implementation
        return 1 }

    private extractContext(content: string, index: number): string { // Mock implementation
        return ' }
    
    private formatExtractionResults(extractedKeys: Map<string, ExtractedKeyInfo>, results: ExtractionResults, outputFormat: string): any { // Mock implementation }
        return { extractedKeys, results }
    
    private generateCategoryTemplate(categoryData: any, options: { includeExamples: boolean,  language: string ): any {
        // Mock implementation }
        return {}

    private convertToCSV(template: TranslationTemplate): string { // Mock implementation
        return ' }

    private convertToXLSX(template: TranslationTemplate): string { // Mock implementation
        return ' }
    
    private async synchronizeCategoryFile(;
        baseCategoryData: any );
        targetCategoryData: any,
    options: any;
    ): Promise<CategorySyncResult>,
        // Mock implementation
        return { added: [], removed: [], updated: []  }
    
    private generateSyncReport(syncResults: SyncResults): string { // Mock implementation
        return JSON.stringify(syncResults, null, 2) }
    
    /**
     * サポート言語を取得
     */''
    getSupportedLanguages('''
        direction: 'ltr' | 'rtl,
    encoding: string);
    }> { return Array.from(this.supportedLanguages.entries().map(([code, info]) => ({
            code: code,
            name: info.name,
            direction: info.direction,
    encoding: info.encoding  }
        });
    }
    
    /**
     * サポートカテゴリを取得
     */
    getSupportedCategories(): Array<{ code: string,
        name: string,
    description: string  }> { return Array.from(this.categories.entries().map(([code, info]) => ({
            code: code,
            name: info.name,
    description: info.description  }
        });
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): { supportedLanguages: number,
        supportedCategories: number,
        templateConfig: TemplateConfig,
    generatedFilesCount: number  } { return { supportedLanguages: this.supportedLanguages.size,
            supportedCategories: this.categories.size,
    templateConfig: this.templateConfig };
            generatedFilesCount: 0 // 実際の実装では生成ファイル数を追跡 
    }
}

// シングルトンインスタンス
let translationFileGeneratorInstance: TranslationFileGenerator | null = null,

/**
 * TranslationFileGeneratorのシングルトンインスタンスを取得
 */
export function getTranslationFileGenerator(): TranslationFileGenerator { if (!translationFileGeneratorInstance) {''
        translationFileGeneratorInstance = new TranslationFileGenerator(' }''