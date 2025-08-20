/**
 * LazyTranslationLoader.ts
 * 遅延翻訳ローダー - 高度な遅延読み込みと最適化機能を持つ翻訳システム
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface LoadingStats { totalRequests: number,
    cacheHits: number,
    cacheMisses: number,
    bytesLoaded: number,
    bytesCompressed: number,
    loadTimes: number[],
    memoryUsage: number; }
}

export interface CacheItem { data: any,
    timestamp: number,
    size: number,
    compressed?: boolean;
    lastAccess: number; }
}
';
export interface LoadOptions { forceReload?: boolean;''
    priority?: 'high' | 'normal' | 'low';
    compress?: boolean;
    timeout?: number; }
}

export interface TranslationNamespace { [key: string]: any, }
}

export interface PerformanceMonitor { slowLoadThreshold: number,
    maxConcurrentLoads: number,
    currentLoads: number,
    loadQueue: Array<() => Promise<any>>; }
}

/**
 * 遅延翻訳ローダークラス
 */
export class LazyTranslationLoader {
    // 基本設定
    private baseURL: string;
    private translationFiles: string[];
    // 読み込み管理
    private loadedTranslations: Map<string, TranslationNamespace>;
    private loadingPromises: Map<string, Promise<any>>;
    private loadedNamespaces: Set<string>;
    private pendingRequests: Map<string, Promise<any>>;
    
    // 遅延読み込み設定
    private lazyLoadingEnabled: boolean;
    private preloadCriticalFiles: string[];
    private loadOnDemandFiles: string[];
    // キャッシュシステム
    private memoryCache: Map<string, CacheItem>;
    private compressionEnabled: boolean;
    private maxCacheSize: number;
    private cacheTimeout: number;
    // メモリ最適化
    private memoryThreshold: number;
    private compressionThreshold: number;
    private unusedDataCleanupInterval: number;
    // 統計とモニタリング
    private stats: LoadingStats;
    private performanceMonitor: PerformanceMonitor';
'';
    constructor(''';
        this.baseURL = '/src/locales/';'
        this.translationFiles = ['';
            'common','';
            'menu', '';
            'game','';
            'settings','';
            'errors','';
            'achievements',']';
            'help'];
        ];
        
        // 読み込み管理)
        this.loadedTranslations = new Map<string, TranslationNamespace>();
        this.loadingPromises = new Map<string, Promise<any>>();'
        this.loadedNamespaces = new Set<string>();''
        this.pendingRequests = new Map<string, Promise<any>>(');
        
        // 遅延読み込み設定'
        this.lazyLoadingEnabled = true;''
        this.preloadCriticalFiles = ['common', 'menu']; // 最重要ファイル''
        this.loadOnDemandFiles = ['achievements', 'help']; // 必要時読み込み
        
        // キャッシュシステム
        this.memoryCache = new Map<string, CacheItem>();
        this.compressionEnabled = true;
        this.maxCacheSize = 50; // キャッシュする最大ファイル数
        this.cacheTimeout = 600000; // 10分間キャッシュ
        
        // メモリ最適化
        this.memoryThreshold = 10 * 1024 * 1024; // 10MB
        this.compressionThreshold = 1024; // 1KB以上で圧縮
        this.unusedDataCleanupInterval = 300000; // 5分間隔でクリーンアップ
        
        // 統計とモニタリング
        this.stats = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            bytesLoaded: 0,
            bytesCompressed: 0,
            loadTimes: [],
            memoryUsage: 0 }
        },
        
        // パフォーマンス監視
        this.performanceMonitor = { slowLoadThreshold: 1000, // 1秒
            maxConcurrentLoads: 3,
            currentLoads: 0,
            loadQueue: [] }
        },
        
        // 定期クリーンアップの開始
        this.startPeriodicCleanup();
    }
    
    /**
     * 言語データの遅延読み込み'
     */''
    async loadLanguage(language: string, options: LoadOptions = { )'): Promise<TranslationNamespace> {'
        const { ''
            priority = 'normal',
            forceReload = false,
            compress = this.compressionEnabled,
            timeout = 5000 } = options;
        
        try { this.stats.totalRequests++;
            
            // 既に読み込み中の場合は待機
            if(this.loadingPromises.has(language) {
                
            }
                return await this.loadingPromises.get(language); }
            }
            
            // キャッシュチェック
            if(!forceReload && this.loadedTranslations.has(language) {
                this.stats.cacheHits++;
            }
                return this.loadedTranslations.get(language)!; }
            }
            
            this.stats.cacheMisses++;
            
            // 読み込み処理
            const loadPromise = this._performLazyLoad(language, { priority)
                compress,);
                timeout);
            
            this.loadingPromises.set(language, loadPromise);
            
            try {
                const result = await loadPromise;
                this._updateMemoryUsage();
                return result; }
            } finally { this.loadingPromises.delete(language); }'
            } catch (error) { ''
            getErrorHandler(').handleError(error, 'LAZY_TRANSLATION_LOADER_ERROR', {')'
                operation: 'loadLanguage');
                language,);
                options); }
            });
            return {};
        }
    }
    
    /**
     * 遅延読み込みの実行
     */
    private async _performLazyLoad(language: string, options: any): Promise<TranslationNamespace> {
        const { priority, preload, namespace } = options;
        
        // 同時読み込み数の制御
        if (this.performanceMonitor.currentLoads >= this.performanceMonitor.maxConcurrentLoads) { return await this._queueLoad(language, options); }
        }
        
        this.performanceMonitor.currentLoads++;
        const startTime = performance.now();
        
        try { let filesToLoad = this.translationFiles;
            
            // 名前空間指定の場合
            if(namespace) {
                
            }
                filesToLoad = [namespace]; }
            }'
            // プリロードの場合は重要ファイルのみ''
            else if (preload') { filesToLoad = this.preloadCriticalFiles; }
            }'
            // 遅延読み込みが有効な場合''
            else if (this.lazyLoadingEnabled && priority !== 'high') { filesToLoad = this._determineFilesToLoad(language); }
            }
            
            const translations = await this._loadLanguageFiles(language, filesToLoad);
            
            // メモリ最適化
            const optimizedTranslations = await this._optimizeTranslationData(translations);
            
            // キャッシュに保存
            this._cacheTranslations(language, optimizedTranslations);
            
            // 統計更新
            const loadTime = performance.now() - startTime;
            this.stats.loadTimes.push(loadTime);
            
            if(loadTime > this.performanceMonitor.slowLoadThreshold) {
            
                
            
            }
                console.warn(`Slow translation load detected: ${loadTime}ms for ${language)`});
            }
            
            return optimizedTranslations;
            
        } finally { this.performanceMonitor.currentLoads--;
            this._processLoadQueue(); }
        }
    }
    
    /**
     * 読み込むファイルを決定
     */
    _determineFilesToLoad(language) {
        const filesToLoad = [...this.preloadCriticalFiles];
        
        // 使用頻度の高いファイルを優先
        const usageStats = this._getUsageStats(language);
        const additionalFiles = this.translationFiles;
            .filter(file => !filesToLoad.includes(file) && !this.loadOnDemandFiles.includes(file);
            .sort((a, b) => (usageStats[b] || 0) - (usageStats[a] || 0));
            .slice(0, 3); // 上位3ファイル
        
    }
        return [...filesToLoad, ...additionalFiles]; }
    }
    
    /**
     * 使用統計を取得
     */
    _getUsageStats(language) {
        
    }
        const stats = {};
        // 実際の使用統計を計算（簡略版）
        this.translationFiles.forEach(file => {  ); }
            stats[file] = Math.random() * 100; // 実際の実装では使用頻度を追跡 }
        });
        return stats;
    }
    
    /**
     * 読み込みキューに追加
     */
    async _queueLoad(language, options) { return new Promise((resolve, reject) => { 
            this.performanceMonitor.loadQueue.push({
                language,);
                options);
                resolve,) }
                reject); }
            });
        });
    }
    
    /**
     * 読み込みキューを処理
     */
    _processLoadQueue() {
        if (this.performanceMonitor.loadQueue.length > 0 && ;
            this.performanceMonitor.currentLoads < this.performanceMonitor.maxConcurrentLoads) {
    }
             }
            const { language, options, resolve, reject } = this.performanceMonitor.loadQueue.shift();
            
            this._performLazyLoad(language, options);
                .then(resolve);
                .catch(reject);
        }
    }
    
    /**
     * 言語ファイルを読み込み
     */
    async _loadLanguageFiles(language, filesToLoad) {
        const translations = {};
        const loadPromises = [];
        
        for(const file of filesToLoad) {
        
            const promise = this._loadTranslationFileWithCompression(language, file);
                .then(data => { );
        
        }
                    if (data) { }
                        translations[file] = data.translations || data; }
                        this.loadedNamespaces.add(`${language}:${file}`);
                    }
                })
                .catch(error => { ); }
                    console.warn(`Failed to load ${file}.json for ${language):`, error});
                });
            
            loadPromises.push(promise);
        }
        
        await Promise.all(loadPromises);
        return this._flattenTranslations(translations);
    }
    
    /**
     * 圧縮対応の翻訳ファイル読み込み
     */
    async _loadTranslationFileWithCompression(language, filename) { try { }
            const cacheKey = `${language}:${filename}`;
            
            // メモリキャッシュチェック
            if(this.memoryCache.has(cacheKey) {
                const cached = this.memoryCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
            }
                    return this._decompressData(cached.data); }
                }
            }
            
            const url = `${this.baseURL}${language}/${filename}.json`;
            const response = await fetch(url);
            
            if(!response.ok) {
            
                if (response.status === 404) {
            
            }
                    return null; }
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText)`});
            }
            
            const data = await response.json();
            const dataSize = JSON.stringify(data).length;
            this.stats.bytesLoaded += dataSize;
            
            // 圧縮とキャッシュ
            const compressedData = this._compressData(data, dataSize);
            this._addToMemoryCache(cacheKey, compressedData);
            
            return data;
            
        } catch (error) {
            console.warn(`Failed to load translation file ${language}/${filename}.json:`, error);
            return null;
        }
    }
    
    /**
     * データ圧縮
     */
    _compressData(data, originalSize) { if (!this.compressionEnabled || originalSize < this.compressionThreshold) { }
            return { data, compressed: false, originalSize };
        }
        
        try { // JSON文字列化して基本的な圧縮を行う
            const jsonString = JSON.stringify(data);
            
            // 簡単な圧縮（重複キーの削除、空白の削除等）
            const compressed = this._performBasicCompression(jsonString);
            const compressedSize = compressed.length;
            
            this.stats.bytesCompressed += originalSize - compressedSize;
            
            return { data: compressed,
                compressed: true,
                originalSize, };
                compressedSize }'
            };''
        } catch (error') { ''
            console.warn('Compression failed:', error); }
            return { data, compressed: false, originalSize };
        }
    }
    
    /**
     * 基本的な圧縮処理'
     */''
    _performBasicCompression(jsonString') {'
        // 不要な空白を削除''
        let compressed = jsonString.replace(/\s+/g, ' '');
        
        // 共通パターンの圧縮'
        const commonPatterns = {''
            'accessibility.': 'a11y.','';
            'settings.': 's.','';
            'error.': 'e.',';
    }'
            'menu.': 'm.' }
        };'
        '';
        for (const [pattern, replacement] of Object.entries(commonPatterns)') { ''
            compressed = compressed.replace(new RegExp(pattern, 'g'), replacement); }
        }
        
        return compressed;
    }
    
    /**
     * データ展開
     */
    _decompressData(compressedData) {'
        '';
        if (!compressedData.compressed') {
    }
            return compressedData.data; }
        }
        
        try { // 基本的な展開処理
            let decompressed = compressedData.data;
            
            // パターンを復元'
            const patterns = {''
                'a11y.': 'accessibility.','';
                's.': 'settings.','';
                'e.': 'error.','';
                'm.': 'menu.' }
            };'
            '';
            for (const [compressed, original] of Object.entries(patterns)') { ''
                decompressed = decompressed.replace(new RegExp(compressed, 'g'), original); }
            }
            ';
            return JSON.parse(decompressed);''
        } catch (error') { ''
            console.error('Decompression failed:', error);
            return compressedData.data; }
        }
    }
    
    /**
     * メモリキャッシュに追加
     */
    _addToMemoryCache(key, data) {
        // キャッシュサイズ制限
        if (this.memoryCache.size >= this.maxCacheSize) {
    }
            this._evictOldestCacheEntry(); }
        }
        
        this.memoryCache.set(key, { )
            data);
            timestamp: Date.now(),
            accessCount: 0,
            lastAccessed: Date.now(); }
        });
    }
    
    /**
     * 最古のキャッシュエントリを削除
     */
    _evictOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, entry] of this.memoryCache) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
    }
                oldestKey = key; }
            }
        }
        
        if (oldestKey) { this.memoryCache.delete(oldestKey); }
        }
    }
    
    /**
     * 翻訳データの最適化
     */
    async _optimizeTranslationData(translations) { // 重複データの削除
        const optimized = this._removeDuplicateTranslations(translations);
        
        // 使用頻度の低いデータの遅延読み込み
        const lazyOptimized = this._prepareLazyTranslations(optimized);
        
        return lazyOptimized; }
    }
    
    /**
     * 重複翻訳の削除
     */
    _removeDuplicateTranslations(translations) { const seen = new Set(); }
        const optimized = {};'
        '';
        for (const [key, value] of Object.entries(translations)') { ''
            if(typeof value === 'string') {
                if (!seen.has(value) || value.length < 50) { // 短い文字列は重複を許可
                    seen.add(value);
            }
                    optimized[key] = value; }
                } else { // 重複する長い文字列は参照に変換 }
                    optimized[key] = `@ref:${value.substring(0, 20})}`;
                }
            } else { optimized[key] = value; }
            }
        }
        
        return optimized;
    }
    
    /**
     * 遅延翻訳の準備
     */
    _prepareLazyTranslations(translations) {
        
    }
        const critical = {};
        const lazy = {};
        
        for(const [key, value] of Object.entries(translations) {
        
            // 重要度に基づいて分類
            if(this._isCriticalTranslation(key) {
        
        }
                critical[key] = value; }
            } else { lazy[key] = value; }
            }
        }
        
        return { ...critical, };
            _lazy: lazy }
        },
    }
    
    /**
     * 重要な翻訳かどうかを判定'
     */''
    _isCriticalTranslation(key') {'
        '';
        const criticalPrefixes = ['menu.', 'common.', 'error.'];
    }
        return criticalPrefixes.some(prefix => key.startsWith(prefix); }
    }
    
    /**
     * 翻訳をキャッシュ
     */
    _cacheTranslations(language, translations) {
        this.loadedTranslations.set(language, translations);
        
        // 統計更新
        const size = JSON.stringify(translations).length;
    }
        this.stats.memoryUsage += size; }
    }
    
    /**
     * 名前空間別読み込み
     */
    async loadNamespace(namespace, language) { try { }
            if (this.loadedNamespaces.has(`${language}:${ namespace)`) { }
                return this.getNamespaceTranslations(language, namespace});
            }
            
            const data = await this._loadTranslationFileWithCompression(language, namespace);
            if(data) {
                
            }
                this.loadedNamespaces.add(`${language}:${ namespace)`);
                
                // 既存の翻訳に追加 }
                const existingTranslations = this.loadedTranslations.get(language}) || {};
                const namespacedTranslations = data.translations || data;
                
                this.loadedTranslations.set(language, { ...existingTranslations,)
                    ...namespacedTranslations);
                
                return namespacedTranslations; }
            }
            
            return {};'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'LAZY_TRANSLATION_LOADER_ERROR', {')'
                operation: 'loadNamespace');
                namespace,);
                language); }
            });
            return {};
        }
    }
    
    /**
     * 名前空間の翻訳を取得
     */
    getNamespaceTranslations(language, namespace) {
        
    }
        const translations = this.loadedTranslations.get(language) || {};
        const namespacePrefix = `${namespace}.`;
        
        const namespaced = {};
        for(const [key, value] of Object.entries(translations) {
            if(key.startsWith(namespacePrefix) {
        }
                namespaced[key] = value; }
            }
        }
        
        return namespaced;
    }
    
    /**
     * メモリ使用量を更新
     */
    _updateMemoryUsage() {
        let totalSize = 0;
        
        for(const translations of this.loadedTranslations.values() {
    }
            totalSize += JSON.stringify(translations).length; }
        }
        
        for(const cached of this.memoryCache.values() { totalSize += JSON.stringify(cached.data).length; }
        }
        
        this.stats.memoryUsage = totalSize;
        
        // メモリ閾値を超えた場合のクリーンアップ
        if (totalSize > this.memoryThreshold) { this._performMemoryCleanup(); }
        }
    }
    
    /**
     * メモリクリーンアップ'
     */''
    _performMemoryCleanup('')';
        console.log('Performing memory cleanup...');
        
        // 使用頻度の低いキャッシュエントリを削除
        const sortedCache = Array.from(this.memoryCache.entries();
            .sort(([,a], [,b]) => a.accessCount - b.accessCount);
        
        const toRemove = Math.ceil(sortedCache.length * 0.3); // 30%削除
        for (let i = 0; i < toRemove && i < sortedCache.length; i++) { this.memoryCache.delete(sortedCache[i][0]); }
        }
        
        // 遅延読み込みデータのクリーンアップ
        for(const [language, translations] of this.loadedTranslations) {
            if (translations._lazy) {
        }
                // あまり使われていない遅延データを削除 }
                const optimized = { ...translations };
                delete optimized._lazy;
                this.loadedTranslations.set(language, optimized);
            }
        }
        
        this._updateMemoryUsage();
        console.log(`Memory cleanup completed. Current usage: ${Math.round(this.stats.memoryUsage / 1024})}KB`);
    }
    
    /**
     * 定期クリーンアップの開始
     */
    startPeriodicCleanup() { this.cleanupInterval = setInterval(() => {  }
            this._performPeriodicMaintenance(); }
        }, this.unusedDataCleanupInterval);
    }
    
    /**
     * 定期メンテナンス
     */
    _performPeriodicMaintenance() {
        // 期限切れキャッシュの削除
        const now = Date.now();
        for (const [key, entry] of this.memoryCache) {
            if (now - entry.timestamp > this.cacheTimeout) {
    }
                this.memoryCache.delete(key); }
            }
        }
        
        // メモリ使用量チェック
        this._updateMemoryUsage();
        
        // 統計のリセット（古いデータ）
        if (this.stats.loadTimes.length > 1000) { this.stats.loadTimes = this.stats.loadTimes.slice(-100); }
        }
    }
    
    /**
     * 翻訳データをフラット化
     */
    _flattenTranslations(categorizedTranslations) {
        
    }
        const flattened = {};'
        '';
        for (const [category, translations] of Object.entries(categorizedTranslations)') { ''
            if(translations && typeof translations === 'object') {
                for(const [key, value] of Object.entries(translations) {
            }
                    flattened[key] = value; }
                }
            }
        }
        
        return flattened;
    }
    
    /**
     * 複数言語の並列プリロード（最適化版）'
     */''
    async preloadLanguages(languages, options = { )') {' }'
        const { priority = 'high', critical = true } = options;
        
        try { const loadPromises = languages.map(lang => 
                this.loadLanguage(lang, { )
                    priority);
                    preload: critical,);
                    useCache: true );
            ),
            
            const results = await Promise.allSettled(loadPromises);
            const loaded = [];
            const failed = [];'
            '';
            results.forEach((result, index') => { ''
                if (result.status === 'fulfilled') { }
                    loaded.push(languages[index]); }
                } else {  failed.push({)
                        language: languages[index],) }
                        error: result.reason); }
                    });
                }
            });
            
            console.log(`Optimized preload completed - Success: ${loaded.length}, Failed: ${ failed.length)`), }
            return { loaded, failed, stats: this.getPerformanceStats(}) }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'LAZY_TRANSLATION_LOADER_ERROR', {')'
                operation: 'preloadLanguages',);
                languages); }
            });
            return { loaded: [], failed: languages.map(lang => ({ language: lang, error }) };
        }
    }
    
    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats() {
        const avgLoadTime = this.stats.loadTimes.length > 0 ;
            ? this.stats.loadTimes.reduce((a, b) => a + b, 0) / this.stats.loadTimes.length: 0,
            
        const cacheHitRate = this.stats.totalRequests > 0 ;
            ? (this.stats.cacheHits / this.stats.totalRequests) * 100 ;
            : 0;
            
        const compressionRatio = this.stats.bytesLoaded > 0 ;
            ? (this.stats.bytesCompressed / this.stats.bytesLoaded) * 100 ;
            : 0;
        
        return { totalRequests: this.stats.totalRequests,
            cacheHitRate: Math.round(cacheHitRate * 100) / 100,
            averageLoadTime: Math.round(avgLoadTime * 100) / 100,
            memoryUsage: Math.round(this.stats.memoryUsage / 1024), // KB;
            compressionRatio: Math.round(compressionRatio * 100) / 100,
            loadedLanguages: this.loadedTranslations.size,
            loadedNamespaces: this.loadedNamespaces.size,
            cacheEntries: this.memoryCache.size,
    }
            currentLoads: this.performanceMonitor.currentLoads, };
            queuedLoads: this.performanceMonitor.loadQueue.length }
        },
    }
    
    /**
     * 設定の動的更新
     */
    updateConfiguration(config) {
        if (config.lazyLoadingEnabled !== undefined) {
    }
            this.lazyLoadingEnabled = config.lazyLoadingEnabled; }
        }
        
        if (config.maxCacheSize !== undefined) { this.maxCacheSize = config.maxCacheSize; }
        }
        
        if (config.compressionEnabled !== undefined) { this.compressionEnabled = config.compressionEnabled; }
        }'
        '';
        if (config.memoryThreshold !== undefined') { this.memoryThreshold = config.memoryThreshold; }
        }'
        '';
        console.log('LazyTranslationLoader configuration updated:', config);
    }
    
    /**
     * 翻訳データが読み込み済みかチェック
     */
    isLanguageLoaded(language) { return this.loadedTranslations.has(language); }
    }
    
    /**
     * 名前空間が読み込み済みかチェック
     */
    isNamespaceLoaded(language, namespace) {
        
    }
        return this.loadedNamespaces.has(`${language}:${namespace)`});
    }
    
    /**
     * 翻訳データを取得
     */
    getTranslations(language) {
        
    }
        return this.loadedTranslations.get(language) || {};
    }
    
    /**
     * 読み込み済み言語一覧
     */
    getLoadedLanguages() { return Array.from(this.loadedTranslations.keys(); }
    }
    
    /**
     * 言語をアンロード（メモリ節約）
     */
    unloadLanguage(language) {
        const removed = this.loadedTranslations.delete(language);
        
        // キャッシュからも削除
        const keysToDelete = [];
        for(const key of this.memoryCache.keys() {
    }
            if (key.startsWith(`${language):`)) { }
                keysToDelete.push(key});
            }
        }
        keysToDelete.forEach(key => this.memoryCache.delete(key);
        
        // 名前空間も削除
        const namespacesToDelete = [];
        for (const ns of this.loadedNamespaces) { if (ns.startsWith(`${language):`)) { }
                namespacesToDelete.push(ns});
            }
        }
        namespacesToDelete.forEach(ns => this.loadedNamespaces.delete(ns);
        
        if (removed) { this._updateMemoryUsage(); }
            console.log(`Unloaded language ${language) and freed memory`});
        }
        
        return removed;
    }
    
    /**
     * 全キャッシュをクリア
     */
    clearCache() {
        this.memoryCache.clear();'
        this.loadedTranslations.clear();''
        this.loadedNamespaces.clear('');
    }'
        console.log('All caches cleared'); }
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        if (this.cleanupInterval) {
    }
            clearInterval(this.cleanupInterval); }
        }
        ';
        this.clearCache();''
        this.loadingPromises.clear('')';
        console.log('LazyTranslationLoader cleaned up'');'
    }''
}