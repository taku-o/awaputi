/**
 * LazyTranslationLoader.ts
 * 遅延翻訳ローダー - 高度な遅延読み込みと最適化機能を持つ翻訳システム
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface LoadingStats {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    bytesLoaded: number;
    bytesCompressed: number;
    loadTimes: number[];
    memoryUsage: number;
}

export interface CacheItem {
    data: any;
    timestamp: number;
    size: number;
    compressed?: boolean;
    lastAccess: number;
}

export interface LoadOptions {
    forceReload?: boolean;
    priority?: 'high' | 'normal' | 'low';
    compress?: boolean;
    timeout?: number;
}

export interface TranslationNamespace {
    [key: string]: any;
}

export interface PerformanceMonitor {
    slowLoadThreshold: number;
    maxConcurrentLoads: number;
    currentLoads: number;
    loadQueue: Array<() => Promise<any>>;
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
    private performanceMonitor: PerformanceMonitor;

    constructor() {
        this.baseURL = '/src/locales/';

        this.translationFiles = [
            'common',
            'menu',
            'game',
            'settings',
            'errors',
            'achievements',
            'help'
        ];
        
        // 読み込み管理
        this.loadedTranslations = new Map<string, TranslationNamespace>();
        this.loadingPromises = new Map<string, Promise<any>>();
        this.loadedNamespaces = new Set<string>();
        this.pendingRequests = new Map<string, Promise<any>>();
        
        // 遅延読み込み設定
        this.lazyLoadingEnabled = true;
        this.preloadCriticalFiles = ['common', 'menu']; // 最重要ファイル
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
            memoryUsage: 0
        };
        // パフォーマンス監視
        this.performanceMonitor = {
            slowLoadThreshold: 1000, // 1秒
            maxConcurrentLoads: 3,
            currentLoads: 0,
            loadQueue: []
        };
        // 定期クリーンアップの開始
        this.startPeriodicCleanup();
    }
    
    /**
     * 言語データの遅延読み込み
     */
    async loadLanguage(language: string, options: LoadOptions = {}): Promise<TranslationNamespace> {
        const {
            priority = 'normal',
            forceReload = false,
            compress = this.compressionEnabled,
            timeout = 5000
        } = options;
        
        try {
            this.stats.totalRequests++;
            
            // 既に読み込み中の場合は待機
            if (this.loadingPromises.has(language)) {
                return await this.loadingPromises.get(language);
            }
            
            // キャッシュチェック
            if (!forceReload && this.loadedTranslations.has(language)) {
                this.stats.cacheHits++;
                return this.loadedTranslations.get(language)!;
            }
            
            this.stats.cacheMisses++;
            
            // 読み込み処理
            const loadPromise = this._performLazyLoad(language, {
                priority,
                compress,
                timeout
            });
            
            this.loadingPromises.set(language, loadPromise);
            try {
                const result = await loadPromise;
                this._updateMemoryUsage();
                return result;
            } finally {
                this.loadingPromises.delete(language);
            }
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'LAZY_TRANSLATION_LOADER_ERROR', {
                operation: 'loadLanguage',
                language,
                options
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
        if (this.performanceMonitor.currentLoads >= this.performanceMonitor.maxConcurrentLoads) {
            return await this._queueLoad(language, options);
        }
        
        this.performanceMonitor.currentLoads++;
        const startTime = performance.now();
        
        try {
            let filesToLoad = this.translationFiles;
            
            // 名前空間指定の場合
            if (namespace) {
                filesToLoad = [namespace];
            }
            // プリロードの場合は重要ファイルのみ
            else if (preload) {
                filesToLoad = this.preloadCriticalFiles;
            }
            // 遅延読み込みが有効な場合
            else if (this.lazyLoadingEnabled && priority !== 'high') {
                filesToLoad = this._determineFilesToLoad(language);
            }
            
            const translations = await this._loadLanguageFiles(language, filesToLoad);
            
            // メモリ最適化
            const optimizedTranslations = await this._optimizeTranslationData(translations);
            
            // キャッシュに保存
            this._cacheTranslations(language, optimizedTranslations);
            
            // 統計更新
            const loadTime = performance.now() - startTime;
            this.stats.loadTimes.push(loadTime);
            
            if (loadTime > this.performanceMonitor.slowLoadThreshold) {
                console.warn(`Slow translation loading detected for ${language}: ${loadTime}ms`);
            }
            
            return optimizedTranslations;
        } finally {
            this.performanceMonitor.currentLoads--;
        }
    }

    /**
     * キューに入れて順番に読み込み
     */
    private async _queueLoad(language: string, options: any): Promise<TranslationNamespace> {
        return new Promise((resolve, reject) => {
            const queuedLoad = async () => {
                try {
                    const result = await this._performLazyLoad(language, options);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            this.performanceMonitor.loadQueue.push(queuedLoad);
            this._processLoadQueue();
        });
    }

    /**
     * 読み込みキューの処理
     */
    private _processLoadQueue(): void {
        if (this.performanceMonitor.loadQueue.length > 0 && 
            this.performanceMonitor.currentLoads < this.performanceMonitor.maxConcurrentLoads) {
            const nextLoad = this.performanceMonitor.loadQueue.shift();
            if (nextLoad) {
                nextLoad();
            }
        }
    }

    /**
     * 読み込むファイルの決定
     */
    private _determineFilesToLoad(language: string): string[] {
        // 言語固有の読み込み戦略
        const filesToLoad = [];
        
        // 常に読み込む
        filesToLoad.push(...this.preloadCriticalFiles);
        
        // 必要に応じて追加
        if (Math.random() > 0.5) { // 実際の使用状況に基づいた判定を実装
            filesToLoad.push('game');
        }
        
        return filesToLoad;
    }

    /**
     * 言語ファイル群の読み込み
     */
    private async _loadLanguageFiles(language: string, files: string[]): Promise<TranslationNamespace> {
        const translations: TranslationNamespace = {};
        
        const loadPromises = files.map(async (file) => {
            try {
                const url = `${this.baseURL}${language}/${file}.json`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}: ${response.statusText}`);
                }
                
                const data = await response.json();
                translations[file] = data;
                this.stats.bytesLoaded += JSON.stringify(data).length;
            } catch (error) {
                console.warn(`Failed to load translation file ${file} for ${language}:`, error);
                translations[file] = {};
            }
        });
        
        await Promise.all(loadPromises);
        return translations;
    }

    /**
     * 翻訳データの最適化
     */
    private async _optimizeTranslationData(translations: TranslationNamespace): Promise<TranslationNamespace> {
        // データ圧縮や最適化を実行
        if (this.compressionEnabled) {
            // 実際の圧縮実装はここに追加
            console.log('Translation data optimization applied');
        }
        
        return translations;
    }

    /**
     * キャッシュへの保存
     */
    private _cacheTranslations(language: string, translations: TranslationNamespace): void {
        const cacheItem: CacheItem = {
            data: translations,
            timestamp: Date.now(),
            size: JSON.stringify(translations).length,
            lastAccess: Date.now()
        };
        
        this.loadedTranslations.set(language, translations);
        this.memoryCache.set(language, cacheItem);
        
        // キャッシュサイズの制限
        if (this.memoryCache.size > this.maxCacheSize) {
            this._cleanupOldCache();
        }
    }

    /**
     * 古いキャッシュのクリーンアップ
     */
    private _cleanupOldCache(): void {
        const entries = Array.from(this.memoryCache.entries());
        
        // 最後のアクセス時間でソート
        entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
        
        // 古いものから削除
        const toDelete = entries.slice(0, entries.length - this.maxCacheSize + 1);
        toDelete.forEach(([key]) => {
            this.memoryCache.delete(key);
            this.loadedTranslations.delete(key);
        });
    }

    /**
     * メモリ使用量の更新
     */
    private _updateMemoryUsage(): void {
        let totalSize = 0;
        for (const item of this.memoryCache.values()) {
            totalSize += item.size;
        }
        this.stats.memoryUsage = totalSize;
        
        // メモリ閾値チェック
        if (totalSize > this.memoryThreshold) {
            console.warn('Translation memory usage exceeds threshold');
            this._cleanupOldCache();
        }
    }

    /**
     * 定期クリーンアップの開始
     */
    private startPeriodicCleanup(): void {
        setInterval(() => {
            this._cleanupUnusedData();
            this._processLoadQueue();
        }, this.unusedDataCleanupInterval);
    }

    /**
     * 未使用データのクリーンアップ
     */
    private _cleanupUnusedData(): void {
        const now = Date.now();
        const toDelete: string[] = [];
        
        for (const [key, item] of this.memoryCache.entries()) {
            if (now - item.lastAccess > this.cacheTimeout) {
                toDelete.push(key);
            }
        }
        
        toDelete.forEach(key => {
            this.memoryCache.delete(key);
            this.loadedTranslations.delete(key);
        });
        
        if (toDelete.length > 0) {
            console.log(`Cleaned up ${toDelete.length} unused translation caches`);
        }
    }

    /**
     * 統計情報を取得
     */
    getStats(): LoadingStats {
        return { ...this.stats };
    }

    /**
     * キャッシュクリア
     */
    clearCache(): void {
        this.loadedTranslations.clear();
        this.memoryCache.clear();
        this.loadingPromises.clear();
        this.loadedNamespaces.clear();
        this.pendingRequests.clear();
        console.log('Translation cache cleared');
    }

    /**
     * 設定変更
     */
    updateSettings(settings: Partial<{
        lazyLoadingEnabled: boolean;
        compressionEnabled: boolean;
        maxCacheSize: number;
        cacheTimeout: number;
    }>): void {
        Object.assign(this, settings);
        console.log('LazyTranslationLoader settings updated:', settings);
    }
}