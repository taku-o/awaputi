/**
 * 最適化された翻訳ローダー
 * 
 * 翻訳ファイルの読み込み最適化、キャッシュ戦略、
 * メモリ使用量最適化を実装
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface LoadOptions {
    priority?: LoadPriority;
    strategy?: LoadStrategy;
    noCache?: boolean;
    chunkSize?: number;
}

export interface CacheEntry {
    data: any;
    timestamp: number;
    accessCount: number;
    size: number;
}

export interface PreloadResult {
    language: string;
    success: boolean;
    data?: any;
    error?: Error;
}

export interface NetworkConnection {
    effectiveType: NetworkType;
}

export interface MemoryInfo {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit?: number;
}

export interface FileLoadResult {
    file: string;
    data: any | null;
}

export interface PerformanceStats {
    cache: CacheStats;
    network: NetworkStats;
    loadTimes: Record<string, string>;
    memory: MemoryStats;
}

export interface CacheStats {
    hitRate: string;
    totalRequests: number;
    cacheHits: number;
    cacheSize: number;
    maxCacheSize: number;
}

export interface NetworkStats {
    requests: number;
    totalBytesLoaded: number;
    averageBytesPerRequest: number;
}

export interface MemoryStats {
    pressure: boolean;
    cacheMemoryUsage: number;
}

export interface TranslationData {
    [key: string]: any;
    _compressed?: boolean;
    translations?: any;
}

export interface LoadPromiseData {
    language: string;
    startTime: number;
    promise: Promise<any>;
}

export interface CompressionSupport {
    compressionSupported: boolean;
    compressionEnabled: boolean;
    compressionThreshold: number;
}

// Navigator型拡張
declare global {
    interface Navigator {
        connection?: NetworkConnection;
    }
    
    interface Performance {
        memory?: MemoryInfo;
    }
}

export type LoadPriority = 'critical' | 'high' | 'medium' | 'low' | 'preload' | 'lazy';
export type LoadStrategy = 'parallel' | 'sequential' | 'chunked';
export type NetworkType = 'slow-2g' | '2g' | '3g' | '4g';

export class OptimizedTranslationLoader {
    // 基本設定
    private loadedTranslations: Map<string, any>;
    private loadingPromises: Map<string, Promise<any>>;
    private compressionEnabled: boolean;
    private lazyLoadEnabled: boolean;
    
    // キャッシュ設定
    private memoryCache: Map<string, CacheEntry>;
    private maxCacheSize: number;
    private cacheHitRate: number;
    private totalRequests: number;
    private cacheHits: number;
    
    // パフォーマンス監視
    private loadTimes: Map<string, number[]>;
    private networkRequests: number;
    private totalBytesLoaded: number;
    
    // 優先度管理
    private priorityQueue: Map<string, LoadPriority>;
    private preloadQueue: string[];
    
    // 圧縮設定
    private compressionThreshold: number;
    
    // システム情報
    private serviceWorkerSupported: boolean;
    private compressionSupported: boolean;
    private networkConnection: NetworkConnection;
    private memoryInfo: MemoryInfo;
    
    // 現在の言語取得関数（オプション）
    private getCurrentLanguage?: () => string;

    constructor() {
        // 基本設定
        this.loadedTranslations = new Map<string, any>();
        this.loadingPromises = new Map<string, Promise<any>>();
        this.compressionEnabled = true;
        this.lazyLoadEnabled = true;
        
        // キャッシュ設定
        this.memoryCache = new Map<string, CacheEntry>();
        this.maxCacheSize = 50; // 最大50ファイル
        this.cacheHitRate = 0;
        this.totalRequests = 0;
        this.cacheHits = 0;
        
        // パフォーマンス監視
        this.loadTimes = new Map<string, number[]>();
        this.networkRequests = 0;
        this.totalBytesLoaded = 0;
        
        // 優先度管理
        this.priorityQueue = new Map<string, LoadPriority>();
        this.preloadQueue = [];
        
        // 圧縮設定
        this.compressionThreshold = 1024; // 1KB以上で圧縮を検討
        
        // システム情報（初期化で設定）
        this.serviceWorkerSupported = false;
        this.compressionSupported = false;
        this.networkConnection = { effectiveType: '4g' };
        this.memoryInfo = { usedJSHeapSize: 0, totalJSHeapSize: 0 };
        
        // 初期化
        this.initializeOptimizations();
    }
    
    /**
     * 最適化の初期化
     */
    private initializeOptimizations(): void {
        // Service Worker サポートの確認
        this.serviceWorkerSupported = 'serviceWorker' in navigator;
        
        // 圧縮サポートの確認
        this.compressionSupported = 'CompressionStream' in window;
        
        // ネットワーク状態の監視
        this.networkConnection = navigator.connection || { effectiveType: '4g' };
        
        // メモリ状態の監視
        this.memoryInfo = performance.memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
        
        console.log('OptimizedTranslationLoader initialized', {
            serviceWorker: this.serviceWorkerSupported,
            compression: this.compressionSupported,
            networkType: this.networkConnection.effectiveType
        });
    }
    
    /**
     * 言語の読み込み（最適化版）
     */
    async loadLanguage(language: string, options: LoadOptions = {}): Promise<any> {
        const startTime = performance.now();
        this.totalRequests++;
        
        try {
            // 既に読み込み中の場合は既存のPromiseを返す
            if (this.loadingPromises.has(language)) {
                const result = await this.loadingPromises.get(language)!;
                this.recordCacheHit();
                return result;
            }
            
            // キャッシュから確認
            if (this.memoryCache.has(language)) {
                const cached = this.memoryCache.get(language)!;
                // キャッシュの有効期限チェック（10分）
                if (Date.now() - cached.timestamp < 600000) {
                    this.recordCacheHit();
                    return cached.data;
                } else {
                    this.memoryCache.delete(language);
                }
            }
            
            // 優先度に基づく読み込み
            const priority = options.priority || this.getPriority(language);
            const loadPromise = this._loadLanguageOptimized(language, priority, options);
            
            this.loadingPromises.set(language, loadPromise);
            
            const result = await loadPromise;
            const loadTime = performance.now() - startTime;
            
            // パフォーマンス記録
            this.recordLoadTime(language, loadTime);
            
            // キャッシュに保存
            this.cacheTranslation(language, result);
            
            // 読み込み完了後のクリーンアップ
            this.loadingPromises.delete(language);
            
            return result;
            
        } catch (error) {
            this.loadingPromises.delete(language);
            getErrorHandler().handleError(error as Error, 'TRANSLATION_LOAD_ERROR', {
                operation: 'loadLanguage',
                language: language,
                options: options
            });
            throw error;
        }
    }
    
    /**
     * 最適化された言語読み込み（内部メソッド）
     */
    private async _loadLanguageOptimized(language: string, priority: LoadPriority, options: LoadOptions): Promise<any> {
        const files = this.getLanguageFiles(language);
        const loadStrategy = this.determineLoadStrategy(priority, options);
        
        switch (loadStrategy) {
            case 'parallel':
                return await this._loadParallel(language, files, options);
            case 'sequential':
                return await this._loadSequential(language, files, options);
            case 'chunked':
                return await this._loadChunked(language, files, options);
            default:
                return await this._loadParallel(language, files, options);
        }
    }
    
    /**
     * 並列読み込み
     */
    private async _loadParallel(language: string, files: string[], options: LoadOptions): Promise<any> {
        const translations: Record<string, any> = {};
        
        const loadPromises = files.map(async (file): Promise<FileLoadResult> => {
            try {
                const data = await this._loadSingleFile(language, file, options);
                return { file, data };
            } catch (error) {
                console.warn(`Failed to load ${file}.json for ${language}:`, error);
                return { file, data: null };
            }
        });
        
        const results = await Promise.all(loadPromises);
        
        results.forEach(({ file, data }) => {
            if (data) {
                translations[file] = data.translations || data;
            }
        });
        
        return this.flattenTranslations(translations);
    }
    
    /**
     * 順次読み込み
     */
    private async _loadSequential(language: string, files: string[], options: LoadOptions): Promise<any> {
        const translations: Record<string, any> = {};
        
        for (const file of files) {
            try {
                const data = await this._loadSingleFile(language, file, options);
                if (data) {
                    translations[file] = data.translations || data;
                }
            } catch (error) {
                console.warn(`Failed to load ${file}.json for ${language}:`, error);
            }
        }
        
        return this.flattenTranslations(translations);
    }
    
    /**
     * チャンク読み込み
     */
    private async _loadChunked(language: string, files: string[], options: LoadOptions): Promise<any> {
        const chunkSize = options.chunkSize || 3;
        const translations: Record<string, any> = {};
        
        for (let i = 0; i < files.length; i += chunkSize) {
            const chunk = files.slice(i, i + chunkSize);
            
            const chunkPromises = chunk.map(async (file): Promise<FileLoadResult> => {
                try {
                    const data = await this._loadSingleFile(language, file, options);
                    return { file, data };
                } catch (error) {
                    console.warn(`Failed to load ${file}.json for ${language}:`, error);
                    return { file, data: null };
                }
            });
            
            const chunkResults = await Promise.all(chunkPromises);
            
            chunkResults.forEach(({ file, data }) => {
                if (data) {
                    translations[file] = data.translations || data;
                }
            });
            
            // チャンク間の短い遅延（ブラウザ負荷軽減）
            if (i + chunkSize < files.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return this.flattenTranslations(translations);
    }
    
    /**
     * 単一ファイルの読み込み
     */
    private async _loadSingleFile(language: string, file: string, options: LoadOptions): Promise<TranslationData> {
        const url = `/assets/i18n/${language}/${file}.json`;
        const startTime = performance.now();
        
        try {
            // ネットワーク状態に応じたタイムアウト設定
            const timeout = this.getNetworkTimeout();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, {
                signal: controller.signal,
                cache: options.noCache ? 'no-cache' : 'default',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, br, deflate'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // レスポンスサイズの記録
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                this.totalBytesLoaded += parseInt(contentLength, 10);
            }
            
            // データの読み込みと解析
            let data: TranslationData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // フォールバック
                const text = await response.text();
                data = JSON.parse(text);
            }
            
            // 圧縮されたデータの展開
            if (data._compressed) {
                data = await this.decompressData(data);
            }
            
            const loadTime = performance.now() - startTime;
            this.networkRequests++;
            
            console.debug(`Loaded ${file}.json for ${language} in ${loadTime.toFixed(2)}ms`);
            
            return data;
            
        } catch (error) {
            const loadTime = performance.now() - startTime;
            console.warn(`Failed to load ${file}.json for ${language} after ${loadTime.toFixed(2)}ms:`, error);
            throw error;
        }
    }
    
    /**
     * 事前読み込み（複数言語）
     */
    async preloadLanguages(languages: string[], options: LoadOptions = {}): Promise<Map<string, any>> {
        console.log(`Preloading languages: ${languages.join(', ')}`);
        
        const results = new Map<string, any>();
        const preloadPromises: Promise<PreloadResult>[] = [];
        
        // 優先度順にソート
        const sortedLanguages = this.sortByPriority(languages);
        
        for (const language of sortedLanguages) {
            const preloadPromise = this.loadLanguage(language, {
                ...options,
                priority: 'preload'
            }).then(data => {
                results.set(language, data);
                return { language, success: true, data };
            }).catch((error: Error) => {
                console.warn(`Preload failed for ${language}:`, error);
                return { language, success: false, error };
            });
            
            preloadPromises.push(preloadPromise);
            
            // 負荷分散のため段階的に開始
            if (preloadPromises.length >= 2) {
                await Promise.race(preloadPromises);
            }
        }
        
        const preloadResults = await Promise.allSettled(preloadPromises);
        
        console.log('Preload completed', {
            total: languages.length,
            successful: preloadResults.filter(r => r.status === 'fulfilled' && r.value?.success).length,
            failed: preloadResults.filter(r => r.status === 'rejected' || !r.value?.success).length
        });
        
        return results;
    }
    
    /**
     * 遅延読み込み
     */
    async lazyLoadNamespace(language: string, namespace: string): Promise<any | null> {
        if (!this.lazyLoadEnabled) {
            return null;
        }
        
        const cacheKey = `${language}:${namespace}`;
        
        if (this.memoryCache.has(cacheKey)) {
            this.recordCacheHit();
            return this.memoryCache.get(cacheKey)!.data;
        }
        
        try {
            const data = await this._loadSingleFile(language, namespace, { priority: 'lazy' });
            
            if (data) {
                this.cacheTranslation(cacheKey, data);
                return data;
            }
            
            return null;
            
        } catch (error) {
            console.warn(`Lazy load failed for ${namespace} in ${language}:`, error);
            return null;
        }
    }
    
    /**
     * キャッシュ管理
     */
    private cacheTranslation(key: string, data: any): void {
        // メモリ使用量チェック
        if (this.isMemoryPressure()) {
            this.evictLeastRecentlyUsed();
        }
        
        // キャッシュサイズ制限
        if (this.memoryCache.size >= this.maxCacheSize) {
            this.evictLeastRecentlyUsed();
        }
        
        this.memoryCache.set(key, {
            data: data,
            timestamp: Date.now(),
            accessCount: 0,
            size: this.estimateDataSize(data)
        });
    }
    
    /**
     * LRU キャッシュエビクション
     */
    private evictLeastRecentlyUsed(): void {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();
        
        for (const [key, cache] of this.memoryCache) {
            if (cache.timestamp < oldestTime) {
                oldestTime = cache.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
            console.debug(`Evicted cache entry: ${oldestKey}`);
        }
    }
    
    /**
     * データサイズの推定
     */
    private estimateDataSize(data: any): number {
        try {
            return JSON.stringify(data).length * 2; // 概算（UTF-16）
        } catch (error) {
            return 1000; // デフォルト値
        }
    }
    
    /**
     * メモリ圧迫状態の判定
     */
    private isMemoryPressure(): boolean {
        if (!this.memoryInfo.usedJSHeapSize) {
            return false;
        }
        
        const usageRatio = this.memoryInfo.usedJSHeapSize / this.memoryInfo.totalJSHeapSize;
        return usageRatio > 0.85; // 85%以上でメモリ圧迫
    }
    
    /**
     * ネットワークタイムアウトの取得
     */
    private getNetworkTimeout(): number {
        const baseTimeout = 5000; // 5秒
        
        switch (this.networkConnection.effectiveType) {
            case 'slow-2g':
                return baseTimeout * 4;
            case '2g':
                return baseTimeout * 3;
            case '3g':
                return baseTimeout * 2;
            case '4g':
            default:
                return baseTimeout;
        }
    }
    
    /**
     * 読み込み戦略の決定
     */
    private determineLoadStrategy(priority: LoadPriority, options: LoadOptions): LoadStrategy {
        if (options.strategy) {
            return options.strategy;
        }
        
        // ネットワーク状態に基づく判定
        if (this.networkConnection.effectiveType === 'slow-2g' || 
            this.networkConnection.effectiveType === '2g') {
            return 'sequential';
        }
        
        // メモリ状態に基づく判定
        if (this.isMemoryPressure()) {
            return 'chunked';
        }
        
        // 優先度に基づく判定
        if (priority === 'high' || priority === 'critical') {
            return 'parallel';
        }
        
        return 'parallel';
    }
    
    /**
     * 言語ファイルリストの取得
     */
    private getLanguageFiles(language: string): string[] {
        return [
            'common',
            'menu', 
            'game',
            'settings',
            'errors',
            'achievements',
            'help'
        ];
    }
    
    /**
     * 優先度の取得
     */
    private getPriority(language: string): LoadPriority {
        // 現在の言語は高優先度
        const currentLanguage = this.getCurrentLanguage?.() || 'ja';
        if (language === currentLanguage) {
            return 'high';
        }
        
        // フォールバック言語は中優先度
        if (language === 'en' || language === 'ja') {
            return 'medium';
        }
        
        return 'low';
    }
    
    /**
     * 優先度によるソート
     */
    private sortByPriority(languages: string[]): string[] {
        const priorityOrder: Record<LoadPriority, number> = { 
            critical: 4, high: 3, medium: 2, low: 1, preload: 2, lazy: 1 
        };
        
        return languages.sort((a, b) => {
            const aPriority = priorityOrder[this.getPriority(a)] || 1;
            const bPriority = priorityOrder[this.getPriority(b)] || 1;
            return bPriority - aPriority;
        });
    }
    
    /**
     * 翻訳データの平坦化
     */
    private flattenTranslations(translations: Record<string, any>): any {
        const flattened: Record<string, any> = {};
        
        for (const [namespace, data] of Object.entries(translations)) {
            if (data && typeof data === 'object') {
                Object.assign(flattened, data);
            }
        }
        
        return flattened;
    }
    
    /**
     * データの圧縮（将来の実装）
     */
    async compressData(data: any): Promise<any> {
        if (!this.compressionSupported || !this.compressionEnabled) {
            return data;
        }
        
        // 実装は将来のバージョンで
        return data;
    }
    
    /**
     * データの展開
     */
    async decompressData(compressedData: TranslationData): Promise<TranslationData> {
        if (!compressedData._compressed) {
            return compressedData;
        }
        
        // 実装は将来のバージョンで
        return compressedData;
    }
    
    /**
     * キャッシュヒットの記録
     */
    private recordCacheHit(): void {
        this.cacheHits++;
        this.cacheHitRate = (this.cacheHits / this.totalRequests) * 100;
    }
    
    /**
     * 読み込み時間の記録
     */
    private recordLoadTime(language: string, time: number): void {
        if (!this.loadTimes.has(language)) {
            this.loadTimes.set(language, []);
        }
        
        const times = this.loadTimes.get(language)!;
        times.push(time);
        
        // 最新10回分のみ保持
        if (times.length > 10) {
            times.shift();
        }
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats(): PerformanceStats {
        const stats: PerformanceStats = {
            cache: {
                hitRate: this.cacheHitRate.toFixed(2) + '%',
                totalRequests: this.totalRequests,
                cacheHits: this.cacheHits,
                cacheSize: this.memoryCache.size,
                maxCacheSize: this.maxCacheSize
            },
            network: {
                requests: this.networkRequests,
                totalBytesLoaded: this.totalBytesLoaded,
                averageBytesPerRequest: this.networkRequests > 0 ? 
                    Math.round(this.totalBytesLoaded / this.networkRequests) : 0
            },
            loadTimes: {},
            memory: {
                pressure: this.isMemoryPressure(),
                cacheMemoryUsage: Array.from(this.memoryCache.values())
                    .reduce((total, cache) => total + cache.size, 0)
            }
        };
        
        // 言語別の平均読み込み時間
        for (const [language, times] of this.loadTimes) {
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            stats.loadTimes[language] = `${avgTime.toFixed(2)}ms`;
        }
        
        return stats;
    }
    
    /**
     * 現在の言語取得関数を設定
     */
    setCurrentLanguageGetter(getter: () => string): void {
        this.getCurrentLanguage = getter;
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache(): void {
        this.memoryCache.clear();
        this.loadTimes.clear();
        this.cacheHitRate = 0;
        this.totalRequests = 0;
        this.cacheHits = 0;
        console.log('Translation cache cleared');
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.clearCache();
        this.loadingPromises.clear();
        this.priorityQueue.clear();
    }
}