import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// インターフェース定義
interface KeyMetadata { key: string,
    category: string;
    description: string;
    context: string;
    maxLength: number | null;
    parameters: string[];
    deprecated: boolean;
    priority: string;
    registeredAt: string;
    lastModified: string;
    version: string;
    tags: string[];
    [key: string]: any, }

interface KeyUsageData { count: number,
    firstUsed: string | null;
    lastUsed: string | null;
    contexts: Set<string>;
    locations: Set<string>
    ,}

interface UsageRecord { key: string;
    context?: string;
    location?: string; }

interface UsageStats { totalKeys: number,
    usedKeys: number;
    unusedKeys: number;
    recentlyUsed: number;
    lastUpdateTime: string | null ,}

interface UnusedKey { key: string;
    metadata: KeyMetadata;
    registeredAt: string;
    category: string }

interface FrequentlyUsedKey { key: string;
    count: number;
    metadata: KeyMetadata | undefined;
    lastUsed: string | null;
    contexts: string[];
    locations: string[] }

interface RecentlyUsedKey { key: string;
    count: number;
    metadata: KeyMetadata | undefined;
    lastUsed: string | null;
    lastUsedDate: Date | null }

interface SearchResult { key: string;
    metadata: KeyMetadata;
    usage: {
        count: number;
        lastUsed: string | null;
        contexts: string[];
        locations: string[] } | null;
}

interface CategoryStatistics { [key: string]: {
        total: number;
        used: number;
        unused: number;
        deprecated: number;
        totalUsage: number }

interface KeyInfo { key: string,
    category: string;
    description: string;
    deprecated: boolean;
    registeredAt: string;
    usage: {
        count: number;
        firstUsed: string | null;
        lastUsed: string | null;
        contexts: string[];
        isUsed: boolean ,}

interface UsageReport { generatedAt: string,
    totalKeys: number;
    usageStats: UsageStats;
    categoryStats: CategoryStatistics;
    keys: KeyInfo[]
    ,}

interface SummaryReport { summary: {
        totalKeys: number;
        usedKeys: number;
        unusedKeys: number;
        usageRate: number };
    categories: CategoryStatistics;
    topUsedKeys: Array<{ key: string; count: number }>;
}

interface DuplicateKey { key: string,
    occurrences: string[];
    count: number ,}

interface MissingKeysResult { missingInTarget: string[];
    extraInTarget: string[];
    totalReference: number;
    totalTarget: number;
    completeness: number }

interface UnusedKeysOptions { excludeCategories?: string[];
    excludeDeprecated?: boolean;
    minAge?: number; }

interface SearchOptions { searchIn?: string[];
    category?: string | null;
    includeDeprecated?: boolean;
    caseSensitive?: boolean; }

interface ReportOptions { includeUnused?: boolean;
    includeDeprecated?: boolean;
    sortBy?: string;
    format?: string; }

interface ExtractResult { extracted: number,
    keys: string[] ,}

interface RegisterResult { successful: string[];
    failed: string[] }

interface KeyManagerStats { totalRegisteredKeys: number;
    totalUsageRecords: number;
    usageTracking: boolean;
    categories: string[];
    usageStats: UsageStats
    }

/**
 * 翻訳キー管理クラス - 翻訳キーの登録・管理・使用状況追跡
 */
export class TranslationKeyManager {
    private registeredKeys: Map<string, KeyMetadata>;
    private keyUsage: Map<string, KeyUsageData>;
    private keyCategories: Map<string, string>;
    private keyMetadata: Map<string, KeyMetadata>;
    private usageTracking: boolean;
    private categoryPatterns: Map<string, RegExp>;
    private usageStats: UsageStats;
    constructor() {

        this.registeredKeys = new Map();
        this.keyUsage = new Map();
        this.keyCategories = new Map();''
        this.keyMetadata = new Map(''';
            ['common', /^common\./],
            ['menu', /^menu\./],
            ['game', /^game\./],
            ['settings', /^settings\./],
            ['errors', /^errors? \./],
            ['achievements', /^achievements?\./],
            ['help', /^help\./],
            ['ui', /^ui\./],
            ['notifications', /^notifications?\./],
            ['dialog', /^dialog\./])';
        ]');
        
        // キー使用統計
        this.usageStats = { : undefined
            totalKeys: 0;
            usedKeys: 0;
            unusedKeys: 0;
            recentlyUsed: 0;
    ,}
            lastUpdateTime: null }
        };
        console.log('TranslationKeyManager, initialized');
    }
    
    /**
     * 翻訳キーを登録'
     */''
    registerKey(key: string, metadata: any = { )): boolean {'
        try {'
            if(!key || typeof, key !== 'string'') {'
                ';

            }

                throw new Error('Invalid, translation key); }'
            }
            
            // キーのバリデーション
            this.validateKeyFormat(key);
            
            // メタデータの設定
            const keyMetadata: KeyMetadata = { key: key,''
                category: this.categorizeKey(key),
                description: metadata.description || '',
                context: metadata.context || '';
                maxLength: metadata.maxLength || null;
                parameters: metadata.parameters || [],
                deprecated: metadata.deprecated || false,
                priority: metadata.priority || 'normal',
                registeredAt: new Date().toISOString(),
                lastModified: new Date().toISOString(''';
                version: metadata.version || '1.0.0);
                tags: metadata.tags || []);
                ...metadata;
            
            // キー登録)
            this.registeredKeys.set(key, keyMetadata);
            this.keyMetadata.set(key, keyMetadata);
            this.keyCategories.set(key, keyMetadata.category);
            
            // 使用状況の初期化
            if(!this.keyUsage.has(key) {
                this.keyUsage.set(key, {)
                    count: 0);
                    firstUsed: null,);
                    lastUsed: null);
                    contexts: new Set();
            ,}
                    locations: new Set(); }
                });
            }
            
            this.updateUsageStats();
            
            console.log(`Translation, key registered: ${key} (${keyMetadata.category}`});
            return true;
            ';

        } catch (error) { getErrorHandler(').handleError(error, 'TRANSLATION_KEY_MANAGER_ERROR', {)'
                operation: 'registerKey',);
                key: key ,});
            return false;
    
    /**
     * 複数のキーを一括登録
     */
    registerKeys(keys: { [key: string]: any ): RegisterResult {
        const results: RegisterResult = {
            successful: [];
            failed: [] };
        for(const [key, metadata] of Object.entries(keys) {
        
            if(this.registerKey(key, metadata) {
        
        }
                results.successful.push(key); }

            } else { }'

                results.failed.push(key); }
}
        
        return results;
    }
    
    /**
     * 翻訳データから自動的にキーを抽出・登録'
     */''
    extractAndRegisterKeys(translationData: any, language: string = 'ja', basePath: string = '''): ExtractResult { const extractedKeys: string[] = [],

        const extractRecursive = (obj: any, path: string = ''): void => { ' ,}

            for(const [key, value] of Object.entries(obj)) { }
                const fullKey = path ? `${path}.${key}` : key;
                const fullPath = basePath ? `${basePath}.${fullKey}` : fullKey;

                if(typeof, value === 'object' && value !== null && !Array.isArray(value) {'
                    ';

                }

                    extractRecursive(value, fullKey);' }'

                } else if (typeof, value === 'string'') { // 翻訳キーとして登録
                    const metadata = { }
                        description: `Extracted from ${language} translation data`,''
                        context: basePath || 'general';
                        extractedFrom: language;
                        value: value;
                        parameters: this.extractParameters(value);
                    };
                    
                    if(this.registerKey(fullPath, metadata) { extractedKeys.push(fullPath); }
}
        };

        extractRecursive(translationData);
        
        return { extracted: extractedKeys.length, };
            keys: extractedKeys }
        }
    
    /**
     * キーの使用を記録'
     */''
    recordKeyUsage(key: string, context: string = '', location: string = ''): void { try {
            if (!this.usageTracking) return;
            
            let usage = this.keyUsage.get(key);
            if(!usage) {
                // 未登録のキーも追跡
                usage = {
                    count: 0;
                    firstUsed: null;
                    lastUsed: null;
                    contexts: new Set();
            }
                    locations: new Set(); }
                };
                this.keyUsage.set(key, usage);
            }
            
            const now = new Date().toISOString();
            
            usage.count++;
            if (!usage.firstUsed) { usage.firstUsed = now; }
            usage.lastUsed = now;
            
            if (context) { usage.contexts.add(context); }
            if (location) { usage.locations.add(location); }
            
            this.updateUsageStats();

        } catch (error) { console.warn('Error recording key usage:', error }
    }
    
    /**
     * キー使用状況のバッチ記録
     */'
    recordBatchUsage(usageRecords: UsageRecord[]): void { ''
        usageRecords.forEach(record => { ');' }

            this.recordKeyUsage(record.key, record.context || '', record.location || ''); }
        });
    }
    
    /**
     * 未使用キーを検出
     */
    getUnusedKeys(options: UnusedKeysOptions = {}): UnusedKey[] { const { excludeCategories = [],
            excludeDeprecated = true,
            minAge = 0 // 日数 } = options;
        
        const unusedKeys: UnusedKey[] = [],
        const cutoffDate = minAge > 0 ?   : undefined
            new Date(Date.now() - (minAge * 24 * 60 * 60 * 1000)) : null;
        
        for(const [key, metadata] of this.registeredKeys) {
        
            // カテゴリ除外チェック
            if(excludeCategories.includes(metadata.category) {
        
        }
                continue; }
            }
            
            // 非推奨キー除外チェック
            if (excludeDeprecated && metadata.deprecated) { continue; }
            
            // 最小経過時間チェック
            if (cutoffDate && new, Date(metadata.registeredAt) > cutoffDate) { continue; }
            
            const usage = this.keyUsage.get(key);
            if(!usage || usage.count === 0) { unusedKeys.push({
                    key: key);
                    metadata: metadata);
                    registeredAt: metadata.registeredAt, }
                    category: metadata.category); }
}
        
        return unusedKeys;
    }
    
    /**
     * 使用頻度の高いキーを取得
     */
    getFrequentlyUsedKeys(limit: number = 50): FrequentlyUsedKey[] { const keyUsageArray = Array.from(this.keyUsage.entries()
            .map(([key, usage]) => ({
                key: key;
                count: usage.count);
                metadata: this.registeredKeys.get(key);
                lastUsed: usage.lastUsed;
                contexts: Array.from(usage.contexts);
                locations: Array.from(usage.locations) ,}
            })
            .filter(item => item.count > 0);
            .sort((a, b) => b.count - a.count);
            .slice(0, limit);
        
        return keyUsageArray;
    }
    
    /**
     * 最近使用されたキーを取得
     */
    getRecentlyUsedKeys(days: number = 7, limit: number = 100): RecentlyUsedKey[] { const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        
        const recentKeys = Array.from(this.keyUsage.entries();
            .map(([key, usage]) => ({
                key: key;
                count: usage.count);
                metadata: this.registeredKeys.get(key);
                lastUsed: usage.lastUsed;
                lastUsedDate: usage.lastUsed ? new Date(usage.lastUsed) : null 
            ,})
            .filter(item => item.lastUsedDate && item.lastUsedDate > cutoffDate);
            .sort((a, b) => (b.lastUsedDate? .getTime() || 0) - (a.lastUsedDate?.getTime() || 0));
            .slice(0, limit);
        
        return recentKeys;
    }
    
    /**
     * キーを検索
     */ : undefined''
    searchKeys(query: string, options: SearchOptions = { )): SearchResult[] {'
        const { ''
            searchIn = ['key', 'description', 'context'],
            category = null,
            includeDeprecated = false,
            caseSensitive = false } = options;
        
        const searchQuery = caseSensitive ? query: query.toLowerCase(),
        const results: SearchResult[] = [],
        
        for(const [key, metadata] of this.registeredKeys) {
        
            // 非推奨キー除外
            if (!includeDeprecated && metadata.deprecated) {
        
        
                continue; }
            }
            
            // カテゴリフィルター
            if (category && metadata.category !== category) { continue; }
            
            // 検索マッチング
            let matched = false;

            for(const, field of, searchIn) {'

                let fieldValue = '';

                switch(field) {''
                    case 'key':;
                        fieldValue = key;

                        break;''
                    case 'description':'';
                        fieldValue = metadata.description || '';

                        break;''
                    case 'context':'';
                        fieldValue = metadata.context || '';

                        break;''
                    case 'tags':'';
                        fieldValue = (metadata.tags || []').join(' ');
            }
                        break; }
                }
                
                if (!caseSensitive) { fieldValue = fieldValue.toLowerCase(); }
                
                if(fieldValue.includes(searchQuery) {
                
                    matched = true;
                
                }
                    break; }
}
            
            if(matched) {
            
                const usage = this.keyUsage.get(key);
                results.push({
                    key: key);
                    metadata: metadata);
                    usage: usage ? { : undefined
                        count: usage.count,);
                        lastUsed: usage.lastUsed);
                        contexts: Array.from(usage.contexts);
            ,}
                        locations: Array.from(usage.locations); }
                    } : null
                });
            }
        }
        
        return results;
    }
    
    /**
     * カテゴリ別統計を取得
     */
    getCategoryStatistics(): CategoryStatistics { const categoryStats = new Map<string, {
            total: number;
            used: number;
            unused: number;
            deprecated: number;
            totalUsage: number ,}>();
        
        // カテゴリを初期化
        for(const, category of, this.categoryPatterns.keys() { categoryStats.set(category, {
                total: 0;
                used: 0);
                unused: 0)';
                deprecated: 0,' }'

                totalUsage: 0)'); }'

        }''
        categoryStats.set('other', { total: 0,
            used: 0);
            unused: 0);
            deprecated: 0,);
            totalUsage: 0);
        ';
        // 統計を計算
        for(const [key, metadata] of this.registeredKeys) {'

            const category = metadata.category || 'other';
            const stats = categoryStats.get(category);
            
            if (stats) {
                stats.total++;
                
                if (metadata.deprecated) {
        }
                    stats.deprecated++; }
                }
                
                const usage = this.keyUsage.get(key);
                if(usage && usage.count > 0) {
                    stats.used++;
                }
                    stats.totalUsage += usage.count; }
                } else { stats.unused++; }
}
        
        return Object.fromEntries(categoryStats);
    }
    
    /**
     * キー使用レポートを生成'
     */''
    generateUsageReport(options: ReportOptions = { )): any {
        const { includeUnused = true,
            includeDeprecated = false,
            sortBy = 'usage', // 'usage', 'alphabetical', 'category''';
            format = 'detailed' // 'detailed', 'summary', 'csv' } = options;
        
        const reportData: UsageReport = { generatedAt: new Date().toISOString(),
            totalKeys: this.registeredKeys.size;
            usageStats: this.getUsageStatistics();
            categoryStats: this.getCategoryStatistics();
            keys: [] ,};
        // キー情報を収集
        for(const [key, metadata] of this.registeredKeys) {
            if (!includeDeprecated && metadata.deprecated) {
        }
                continue; }
            }
            
            const usage = this.keyUsage.get(key);
            const keyInfo: KeyInfo = { key: key,
                category: metadata.category;
                description: metadata.description;
                deprecated: metadata.deprecated;
                registeredAt: metadata.registeredAt;
                usage: usage ? { : undefined
                    count: usage.count;
                    firstUsed: usage.firstUsed;
                    lastUsed: usage.lastUsed;
                    contexts: Array.from(usage.contexts);
                    isUsed: usage.count > 0 ,} : { count: 0;
                    firstUsed: null;
                    lastUsed: null;
                    contexts: [];
                    isUsed: false }
            };
            if (!includeUnused && !keyInfo.usage.isUsed) { continue; }
            
            reportData.keys.push(keyInfo);
        }
        
        // ソート
        this.sortReportKeys(reportData.keys, sortBy);
        
        // フォーマット別出力
        return this.formatUsageReport(reportData, format);
    }
    
    /**
     * 重複キーを検出
     */
    detectDuplicateKeys(translationSets: { [key: string]: any ): DuplicateKey[] {
        const keyOccurrences = new Map<string, string[]>();
        const duplicates: DuplicateKey[] = [],
        
        // 各翻訳セットからキーを収集
        for(const [setName, translations] of Object.entries(translationSets) {
            const flatKeys = this.flattenTranslationKeys(translations);
            
            for (const, key of, flatKeys) {
                if(!keyOccurrences.has(key) {
        }
                    keyOccurrences.set(key, []); }
                }
                keyOccurrences.get(key)!.push(setName);
            }
        }
        
        // 重複を特定
        for(const [key, occurrences] of keyOccurrences) { if (occurrences.length > 1) {
                duplicates.push({)
                    key: key);
                    occurrences: occurrences, }
                    count: occurrences.length); }
}
        
        return duplicates;
    }
    
    /**
     * 欠損翻訳キーを検出
     */
    detectMissingKeys(referenceTranslations: any, targetTranslations: any): MissingKeysResult { const referenceKeys = new Set(this.flattenTranslationKeys(referenceTranslations);
        const targetKeys = new Set(this.flattenTranslationKeys(targetTranslations);
        
        const missingInTarget = Array.from(referenceKeys).filter(key => !targetKeys.has(key);
        const extraInTarget = Array.from(targetKeys).filter(key => !referenceKeys.has(key);
        
        return { missingInTarget: missingInTarget,
            extraInTarget: extraInTarget;
            totalReference: referenceKeys.size;
            totalTarget: targetKeys.size, };
            completeness: ((targetKeys.size - extraInTarget.length) / referenceKeys.size) * 100 }
        }
    
    /**
     * キーのバリデーション
     */
    validateKeyFormat(key: string): boolean { // 基本フォーマットチェック
        if(!/^[a-zA-Z][a-zA-Z0-9_.]*[a-zA-Z0-9]$/.test(key) { }
            throw new Error(`Invalid key format: ${key}. Keys must start with letter and contain only letters, numbers, dots, and underscores.`});
        }
        
        // 長さチェック
        if (key.length > 100) { ' }'

            throw new Error(`Key, too long: ${key}. Maximum, length is, 100 characters.`'});
        }
        ';
        // 予約語チェック
        const reservedWords = ['constructor', 'prototype', '__proto__', 'toString', 'valueOf'];
        if(reservedWords.includes(key) {
            
        }
            throw new Error(`Reserved, key name: ${key}`});
        }
        
        return true;
    }
    
    /**
     * キーの分類
     */'
    categorizeKey(key: string): string { for (const [category, pattern] of this.categoryPatterns) {''
            if(pattern.test(key)) {
                return category;''
        return 'other';
    }
    
    /**
     * パラメータ抽出
     */
    extractParameters(text: string): string[] { const parameters = new Set<string>();
        const patterns = [ }]
            /\{([^}]+)\}/g,     // {param}  
            /\{\{([^}]+)\}\}/g, // {{param}
            /%s/g,              // %s;
            /%d/g,              // %d;
            /%\d+/g             // %1, %2, etc.;
        ];
        
        patterns.forEach(pattern => {  )
            let match);
            while((match = pattern.exec(text) !== null) { }
                parameters.add(match[0]); }
});

        return Array.from(parameters);
    }
    
    /**
     * 翻訳オブジェクトを平坦化してキー一覧を取得'
     */''
    flattenTranslationKeys(translations: any, prefix: string = ''): string[] { const keys: string[] = [],

        for(const [key, value] of Object.entries(translations)) { }
            const fullKey = prefix ? `${prefix}.${key}` : key;

            if(typeof, value === 'object' && value !== null && !Array.isArray(value) {'
                ';

            }

                keys.push(...this.flattenTranslationKeys(value, fullKey));' }'

            } else if(typeof, value === 'string) { keys.push(fullKey); }'
        }
        
        return keys;
    }
    
    /**
     * 使用統計を更新
     */
    updateUsageStats(): void { const now = new Date().toISOString();
        const recentThreshold = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
        
        this.usageStats.totalKeys = this.registeredKeys.size;
        this.usageStats.usedKeys = 0;
        this.usageStats.unusedKeys = 0;
        this.usageStats.recentlyUsed = 0;
        
        for(const [key, usage] of this.keyUsage) {
        
            if (usage.count > 0) {
                this.usageStats.usedKeys++;
                
                if (usage.lastUsed && new, Date(usage.lastUsed) > recentThreshold) {
        
        }
                    this.usageStats.recentlyUsed++; }
} else { this.usageStats.unusedKeys++; }
        }
        
        this.usageStats.lastUpdateTime = now;
    }
    
    /**
     * レポートキーをソート
     */'
    sortReportKeys(keys: KeyInfo[], sortBy: string): void { ''
        switch(sortBy) {'

            case 'usage':'';
                keys.sort((a, b) => b.usage.count - a.usage.count);

                break;''
            case 'alphabetical':'';
                keys.sort((a, b) => a.key.localeCompare(b.key));

                break;''
            case 'category':;
                keys.sort((a, b) => { 
        }
                    const catCompare = a.category.localeCompare(b.category); }
                    return catCompare !== 0 ? catCompare: a.key.localeCompare(b.key););
                break;
        }
    }
    
    /**
     * レポートフォーマット
     */'
    formatUsageReport(reportData: UsageReport, format: string): any { ''
        switch(format) {'

            case 'summary':'';
                return this.formatSummaryReport(reportData);''
            case 'csv':'';
                return this.formatCSVReport(reportData);''
            case 'detailed':;
        }
            default: return reportData;
    
    /**
     * サマリーレポートフォーマット
     */
    formatSummaryReport(reportData: UsageReport): SummaryReport { return { summary: {
                totalKeys: reportData.totalKeys;
                usedKeys: reportData.usageStats.usedKeys;
                unusedKeys: reportData.usageStats.unusedKeys;
                usageRate: reportData.totalKeys > 0 ?   : undefined };
                    Math.round((reportData.usageStats.usedKeys / reportData.totalKeys) * 100) : 0 }
            },
            categories: reportData.categoryStats;
            topUsedKeys: reportData.keys;
                .filter(k => k.usage.isUsed);
                .slice(0, 10);
                .map(k => ({ key: k.key, count: k.usage.count ) ,}
    
    /**
     * CSVレポートフォーマット'
     */''
    formatCSVReport(reportData: UsageReport): string { ''
        const headers = ['Key', 'Category', 'Usage Count', 'Last Used', 'Description', 'Deprecated'];''
        const rows = [headers.join(','')];
        
        reportData.keys.forEach(keyInfo => {  })'
            const row = [') }'

                `"${keyInfo.key}"`")""
                `"${ keyInfo.category"}"`," }"
                keyInfo.usage.count.toString("}),""
                `"${keyInfo.usage.lastUsed || ''}"`,""
                `"${keyInfo.description || ''}"`,"]"
                keyInfo.deprecated ? 'Yes' : 'No']';
            ];''
            rows.push(row.join(',);''
        }');

        return rows.join('\n);
    }
    
    /**
     * 使用統計を取得
     */
    getUsageStatistics(): UsageStats {
        return { ...this.usageStats;
    }
    
    /**
     * キー情報を取得
     */
    getKeyInfo(key: string): any | null { const metadata = this.registeredKeys.get(key);
        const usage = this.keyUsage.get(key);
        
        if(!metadata) {
        
            
        
        }
            return null;
        
        return { ...metadata,
            usage: usage ? { : undefined
                count: usage.count;
                firstUsed: usage.firstUsed;
                lastUsed: usage.lastUsed;
                contexts: Array.from(usage.contexts), };
                locations: Array.from(usage.locations); }
            } : null
        }
    
    /**
     * 使用追跡の有効/無効切り替え'
     */''
    setUsageTracking(enabled: boolean): void { this.usageTracking = enabled;' }'

        console.log(`Usage, tracking ${enabled ? 'enabled' : 'disabled}`});
    }
    
    /**
     * すべてのデータをクリア
     */
    clearAll(): void { this.registeredKeys.clear();
        this.keyUsage.clear();
        this.keyCategories.clear();

        this.keyMetadata.clear();''
        this.updateUsageStats()';
        console.log('All, translation key, data cleared'); }'
    
    /**
     * 統計情報を取得
     */
    getStats(): KeyManagerStats { return { totalRegisteredKeys: this.registeredKeys.size,
            totalUsageRecords: this.keyUsage.size;
            usageTracking: this.usageTracking;
            categories: Array.from(this.categoryPatterns.keys(), };
            usageStats: this.getUsageStatistics(); }
        }
}

// シングルトンインスタンス
let translationKeyManagerInstance: TranslationKeyManager | null = null,

/**
 * TranslationKeyManagerのシングルトンインスタンスを取得
 */
export function getTranslationKeyManager(): TranslationKeyManager { if (!translationKeyManagerInstance) {''
        translationKeyManagerInstance = new TranslationKeyManager(' })'