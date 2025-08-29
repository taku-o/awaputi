import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * モバイルリソース管理クラス
 * 限られたリソースでの効率的なメモリ管理とネットワーク対応を提供
 */
export class MobileResourceManager {
    constructor() {
        this.state = {
            initialized: false,
            memoryBudget: 0,
            networkAware: false
        };
        
        // リソースプール
        this.resourcePools = new Map([
            ['particles', { pool: [], maxSize: 1000, active: 0 }],
            ['textures', { pool: [], maxSize: 50, active: 0 }],
            ['animations', { pool: [], maxSize: 100, active: 0 }],
            ['sounds', { pool: [], maxSize: 20, active: 0 }]
        ]);
        
        // メモリ管理設定
        this.memorySettings = {
            maxHeapUsage: 0.8, // 最大ヒープ使用率
            gcThreshold: 0.7,   // GC実行閾値
            cleanupInterval: 5000, // クリーンアップ間隔（ms）
            lowMemoryThreshold: 0.9 // 低メモリ警告閾値
        };
        
        // ネットワーク設定
        this.networkSettings = {
            enabled: false,
            connection: null,
            dataUsageLimit: 10 * 1024 * 1024, // 10MB
            dataUsageCount: 0,
            preferredFormats: ['webp', 'avif', 'jpg'],
            compressionLevel: 0.8
        };
        
        // キャッシュ管理
        this.caches = new Map([
            ['textures', new Map()],
            ['sounds', new Map()],
            ['animations', new Map()],
            ['effects', new Map()]
        ]);
        
        // リソース使用統計
        this.statistics = {
            memoryAllocated: 0,
            resourcesCreated: 0,
            resourcesDestroyed: 0,
            cacheHits: 0,
            cacheMisses: 0,
            gcInvocations: 0,
            dataTransferred: 0
        };
        
        console.log('MobileResourceManager initialized');
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            console.log('Initializing mobile resource management...');
            
            // メモリ情報の取得
            this.detectMemoryCapabilities();
            
            // ネットワーク情報の取得
            await this.detectNetworkCapabilities();
            
            // リソースプールの初期化
            this.initializeResourcePools();
            
            // 定期クリーンアップの開始
            this.startPeriodicCleanup();
            
            // メモリ監視の開始
            this.startMemoryMonitoring();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.state.initialized = true;
            console.log('Mobile resource management initialized successfully');
            
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'RESOURCE_MANAGEMENT_ERROR', {
                operation: 'initialize',
                component: 'MobileResourceManager'
            });
            return false;
        }
    }
    
    /**
     * メモリ機能の検出
     */
    detectMemoryCapabilities() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.state.memoryBudget = memory.jsHeapSizeLimit;
            
            // メモリ制限に基づいてプール サイズを調整
            const memoryGB = this.state.memoryBudget / (1024 * 1024 * 1024);
            
            if (memoryGB < 1) {
                // 1GB未満: プールサイズを大幅削減
                this.adjustPoolSizes(0.25);
            } else if (memoryGB < 2) {
                // 2GB未満: プールサイズを削減
                this.adjustPoolSizes(0.5);
            } else if (memoryGB >= 4) {
                // 4GB以上: プールサイズを拡張
                this.adjustPoolSizes(1.5);
            }
            
            console.log(`Memory budget: ${(memoryGB).toFixed(2)}GB`);
        } else {
            console.warn('Performance memory API not available');
            // デフォルト値を使用
            this.state.memoryBudget = 512 * 1024 * 1024; // 512MB
        }
    }
    
    /**
     * ネットワーク機能の検出
     */
    async detectNetworkCapabilities() {
        if ('connection' in navigator) {
            this.networkSettings.connection = navigator.connection;
            this.networkSettings.enabled = true;
            
            // 接続タイプに基づく設定調整
            this.adjustNetworkSettings();
            
            // ネットワーク変更の監視
            navigator.connection.addEventListener('change', () => {
                this.adjustNetworkSettings();
            });
            
            console.log('Network-aware features enabled');
        } else {
            console.warn('Network Information API not available');
        }
        
        this.state.networkAware = this.networkSettings.enabled;
    }
    
    /**
     * プールサイズの調整
     */
    adjustPoolSizes(multiplier) {
        for (const [type, pool] of this.resourcePools) {
            const newSize = Math.floor(pool.maxSize * multiplier);
            pool.maxSize = Math.max(newSize, 10); // 最小10個
            console.log(`${type} pool size adjusted to: ${pool.maxSize}`);
        }
    }
    
    /**
     * ネットワーク設定の調整
     */
    adjustNetworkSettings() {
        if (!this.networkSettings.connection) return;
        
        const connection = this.networkSettings.connection;
        const effectiveType = connection.effectiveType;
        
        console.log(`Network type: ${effectiveType}, downlink: ${connection.downlink}Mbps`);
        
        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                this.networkSettings.compressionLevel = 0.6;
                this.networkSettings.dataUsageLimit = 1 * 1024 * 1024; // 1MB
                break;
                
            case '3g':
                this.networkSettings.compressionLevel = 0.7;
                this.networkSettings.dataUsageLimit = 5 * 1024 * 1024; // 5MB
                break;
                
            case '4g':
            default:
                this.networkSettings.compressionLevel = 0.8;
                this.networkSettings.dataUsageLimit = 10 * 1024 * 1024; // 10MB
                break;
        }
    }
    
    /**
     * リソースプールの初期化
     */
    initializeResourcePools() {
        for (const [type, pool] of this.resourcePools) {
            this.preAllocatePool(type, Math.min(pool.maxSize / 4, 25));
        }
        
        console.log('Resource pools initialized');
    }
    
    /**
     * プールの事前割り当て
     */
    preAllocatePool(type, count) {
        const pool = this.resourcePools.get(type);
        if (!pool) return;
        
        for (let i = 0; i < count; i++) {
            const resource = this.createPooledResource(type);
            if (resource) {
                pool.pool.push(resource);
            }
        }
        
        console.log(`Pre-allocated ${count} ${type} resources`);
    }
    
    /**
     * プールされたリソースの作成
     */
    createPooledResource(type) {
        switch (type) {
            case 'particles':
                return this.createParticleResource();
                
            case 'textures':
                return this.createTextureResource();
                
            case 'animations':
                return this.createAnimationResource();
                
            case 'sounds':
                return this.createSoundResource();
                
            default:
                return null;
        }
    }
    
    /**
     * パーティクルリソースの作成
     */
    createParticleResource() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            color: '#FFFFFF',
            opacity: 1,
            life: 1,
            maxLife: 1,
            type: 'basic',
            active: false,
            pooled: true
        };
    }
    
    /**
     * テクスチャリソースの作成
     */
    createTextureResource() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        
        return {
            canvas: canvas,
            context: canvas.getContext('2d'),
            width: 32,
            height: 32,
            active: false,
            pooled: true
        };
    }
    
    /**
     * アニメーションリソースの作成
     */
    createAnimationResource() {
        return {
            startTime: 0,
            duration: 1000,
            elapsed: 0,
            progress: 0,
            easing: 'linear',
            active: false,
            pooled: true,
            onComplete: null
        };
    }
    
    /**
     * サウンドリソースの作成
     */
    createSoundResource() {
        return {
            buffer: null,
            source: null,
            gainNode: null,
            active: false,
            pooled: true
        };
    }
    
    /**
     * リソースの取得
     */
    acquireResource(type, config = {}) {
        const pool = this.resourcePools.get(type);
        if (!pool) return null;
        
        // プールから利用可能なリソースを検索
        let resource = pool.pool.find(r => !r.active);
        
        if (!resource) {
            // プールが満杯の場合
            if (pool.pool.length >= pool.maxSize) {
                console.warn(`${type} pool exhausted, forcing cleanup`);
                this.forceCleanupPool(type);
                resource = pool.pool.find(r => !r.active);
            }
            
            // まだ利用可能なリソースがない場合、新規作成
            if (!resource) {
                resource = this.createPooledResource(type);
                if (resource) {
                    pool.pool.push(resource);
                }
            }
        }
        
        if (resource) {
            resource.active = true;
            pool.active++;
            this.statistics.resourcesCreated++;
            
            // 設定を適用
            this.configureResource(resource, config);
        }
        
        return resource;
    }
    
    /**
     * リソースの設定
     */
    configureResource(resource, config) {
        // 共通プロパティの設定
        Object.assign(resource, config);
        
        // リソース固有の設定
        if (resource.pooled) {
            // プールされたリソースの初期化
            this.resetResourceState(resource);
        }
    }
    
    /**
     * リソース状態のリセット
     */
    resetResourceState(resource) {
        // 基本プロパティのリセット
        if ('life' in resource) {
            resource.life = resource.maxLife || 1;
        }
        
        if ('progress' in resource) {
            resource.progress = 0;
            resource.elapsed = 0;
        }
        
        if ('opacity' in resource) {
            resource.opacity = 1;
        }
    }
    
    /**
     * リソースの解放
     */
    releaseResource(type, resource) {
        if (!resource || !resource.pooled) return;
        
        const pool = this.resourcePools.get(type);
        if (!pool) return;
        
        resource.active = false;
        pool.active = Math.max(0, pool.active - 1);
        this.statistics.resourcesDestroyed++;
        
        // リソースのクリーンアップ
        this.cleanupResource(resource);
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanupResource(resource) {
        // Canvas リソースのクリーンアップ
        if (resource.canvas && resource.context) {
            resource.context.clearRect(0, 0, resource.canvas.width, resource.canvas.height);
        }
        
        // Audio リソースのクリーンアップ
        if (resource.source) {
            try {
                resource.source.stop();
                resource.source.disconnect();
                resource.source = null;
            } catch (error) {
                // 既に停止している場合は無視
            }
        }
        
        // アニメーションリソースのクリーンアップ
        if (resource.onComplete) {
            resource.onComplete = null;
        }
    }
    
    /**
     * プールの強制クリーンアップ
     */
    forceCleanupPool(type) {
        const pool = this.resourcePools.get(type);
        if (!pool) return;
        
        // 非アクティブなリソースをクリーンアップ
        const inactiveResources = pool.pool.filter(r => !r.active);
        inactiveResources.forEach(resource => {
            this.cleanupResource(resource);
        });
        
        // 最も古いアクティブリソースを強制解放
        const activeResources = pool.pool.filter(r => r.active);
        if (activeResources.length > 0) {
            const oldestResource = activeResources[0]; // 簡易的に最初のものを選択
            this.releaseResource(type, oldestResource);
        }
        
        console.log(`Force cleanup performed on ${type} pool`);
    }
    
    /**
     * キャッシュからのリソース取得
     */
    getCachedResource(type, key) {
        const cache = this.caches.get(type);
        if (!cache) return null;
        
        const resource = cache.get(key);
        if (resource) {
            this.statistics.cacheHits++;
            return resource;
        } else {
            this.statistics.cacheMisses++;
            return null;
        }
    }
    
    /**
     * リソースのキャッシュ
     */
    setCachedResource(type, key, resource) {
        const cache = this.caches.get(type);
        if (!cache) return;
        
        // キャッシュサイズ制限
        const maxCacheSize = this.getMaxCacheSize(type);
        if (cache.size >= maxCacheSize) {
            this.evictLRUCacheEntry(cache);
        }
        
        // アクセス時間を記録
        resource._cacheTime = Date.now();
        cache.set(key, resource);
    }
    
    /**
     * キャッシュサイズ制限の取得
     */
    getMaxCacheSize(type) {
        const limits = {
            textures: 20,
            sounds: 10,
            animations: 30,
            effects: 50
        };
        
        return limits[type] || 20;
    }
    
    /**
     * LRU キャッシュエントリの削除
     */
    evictLRUCacheEntry(cache) {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, resource] of cache) {
            if (resource._cacheTime < oldestTime) {
                oldestTime = resource._cacheTime;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            cache.delete(oldestKey);
        }
    }
    
    /**
     * 定期クリーンアップの開始
     */
    startPeriodicCleanup() {
        setInterval(() => {
            this.performPeriodicCleanup();
        }, this.memorySettings.cleanupInterval);
        
        console.log('Periodic cleanup started');
    }
    
    /**
     * 定期クリーンアップの実行
     */
    performPeriodicCleanup() {
        // メモリ使用量チェック
        const memoryUsage = this.getCurrentMemoryUsage();
        
        if (memoryUsage > this.memorySettings.gcThreshold) {
            console.log(`Memory usage: ${(memoryUsage * 100).toFixed(1)}%, performing cleanup`);
            
            // 各プールのクリーンアップ
            for (const type of this.resourcePools.keys()) {
                this.cleanupInactiveResources(type);
            }
            
            // キャッシュのクリーンアップ
            this.cleanupCaches();
            
            // ガベージコレクション実行の提案
            this.suggestGarbageCollection();
        }
    }
    
    /**
     * 現在のメモリ使用量の取得
     */
    getCurrentMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        return 0.5; // デフォルト値
    }
    
    /**
     * 非アクティブリソースのクリーンアップ
     */
    cleanupInactiveResources(type) {
        const pool = this.resourcePools.get(type);
        if (!pool) return;
        
        const inactiveResources = pool.pool.filter(r => !r.active);
        const keepCount = Math.ceil(pool.maxSize * 0.25); // 25%を保持
        
        if (inactiveResources.length > keepCount) {
            const toRemove = inactiveResources.slice(keepCount);
            toRemove.forEach(resource => {
                this.cleanupResource(resource);
                const index = pool.pool.indexOf(resource);
                if (index > -1) {
                    pool.pool.splice(index, 1);
                }
            });
            
            console.log(`Cleaned up ${toRemove.length} inactive ${type} resources`);
        }
    }
    
    /**
     * キャッシュのクリーンアップ
     */
    cleanupCaches() {
        for (const [type, cache] of this.caches) {
            const maxSize = this.getMaxCacheSize(type);
            const targetSize = Math.ceil(maxSize * 0.7); // 70%まで削減
            
            if (cache.size > targetSize) {
                const sortedEntries = Array.from(cache.entries())
                    .sort((a, b) => a[1]._cacheTime - b[1]._cacheTime);
                
                const toRemove = sortedEntries.slice(0, cache.size - targetSize);
                toRemove.forEach(([key]) => cache.delete(key));
                
                console.log(`Cleaned up ${toRemove.length} ${type} cache entries`);
            }
        }
    }
    
    /**
     * ガベージコレクション実行の提案
     */
    suggestGarbageCollection() {
        // 手動GCが利用可能な場合（開発環境）
        if (window.gc && typeof window.gc === 'function') {
            try {
                window.gc();
                this.statistics.gcInvocations++;
                console.log('Manual garbage collection invoked');
            } catch (error) {
                // 本番環境では利用不可
            }
        }
    }
    
    /**
     * メモリ監視の開始
     */
    startMemoryMonitoring() {
        if (!('memory' in performance)) return;
        
        setInterval(() => {
            const memoryUsage = this.getCurrentMemoryUsage();
            
            if (memoryUsage > this.memorySettings.lowMemoryThreshold) {
                console.warn(`Low memory warning: ${(memoryUsage * 100).toFixed(1)}%`);
                this.handleLowMemory();
            }
            
            // 統計更新
            this.statistics.memoryAllocated = performance.memory.usedJSHeapSize;
        }, 2000);
    }
    
    /**
     * 低メモリ時の処理
     */
    handleLowMemory() {
        console.log('Handling low memory condition');
        
        // 緊急クリーンアップ
        for (const type of this.resourcePools.keys()) {
            this.forceCleanupPool(type);
        }
        
        // キャッシュの大幅削減
        for (const cache of this.caches.values()) {
            const entries = Array.from(cache.entries());
            const keepCount = Math.ceil(entries.length * 0.3); // 30%のみ保持
            
            entries.sort((a, b) => b[1]._cacheTime - a[1]._cacheTime); // 新しい順
            entries.slice(keepCount).forEach(([key]) => cache.delete(key));
        }
        
        // 強制GC実行
        this.suggestGarbageCollection();
    }
    
    /**
     * ネットワーク対応リソース読み込み
     */
    async loadNetworkResource(url, type, options = {}) {
        if (!this.state.networkAware) {
            return this.loadResourceDirect(url, type, options);
        }
        
        // データ使用量チェック
        if (this.networkSettings.dataUsageCount >= this.networkSettings.dataUsageLimit) {
            console.warn('Data usage limit reached, using cached resources only');
            return this.getCachedResource(type, url);
        }
        
        // 接続品質に基づく最適化
        const optimizedUrl = this.optimizeResourceUrl(url, type);
        
        try {
            const resource = await this.loadResourceDirect(optimizedUrl, type, options);
            
            // データ使用量を更新
            if (resource && resource.size) {
                this.networkSettings.dataUsageCount += resource.size;
                this.statistics.dataTransferred += resource.size;
            }
            
            // キャッシュに保存
            if (resource) {
                this.setCachedResource(type, url, resource);
            }
            
            return resource;
        } catch (error) {
            console.warn(`Failed to load network resource: ${url}`, error);
            
            // フォールバックとしてキャッシュから取得
            return this.getCachedResource(type, url);
        }
    }
    
    /**
     * リソースURLの最適化
     */
    optimizeResourceUrl(url, type) {
        if (!this.networkSettings.connection) return url;
        
        const connection = this.networkSettings.connection;
        
        // 低速接続の場合の最適化
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            // 低解像度版やプレースホルダーを使用
            if (type === 'texture' || type === 'image') {
                return url.replace(/\.(jpg|png)$/, '_low.$1');
            }
        }
        
        return url;
    }
    
    /**
     * 直接リソース読み込み
     */
    async loadResourceDirect(url, type, options) {
        // 実装は type に応じて分岐
        switch (type) {
            case 'texture':
            case 'image':
                return this.loadImageResource(url, options);
                
            case 'sound':
            case 'audio':
                return this.loadAudioResource(url, options);
                
            default:
                throw new Error(`Unsupported resource type: ${type}`);
        }
    }
    
    /**
     * 画像リソースの読み込み
     */
    async loadImageResource(url, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                resolve({
                    canvas: canvas,
                    context: ctx,
                    width: img.width,
                    height: img.height,
                    size: img.width * img.height * 4, // RGBA
                    url: url
                });
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    /**
     * 音声リソースの読み込み
     */
    async loadAudioResource(url, options) {
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('Web Audio API not supported');
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        return {
            buffer: audioBuffer,
            context: audioContext,
            duration: audioBuffer.duration,
            size: arrayBuffer.byteLength,
            url: url
        };
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // メモリ圧迫の監視
        window.addEventListener('memory-pressure', () => {
            this.handleLowMemory();
        });
        
        // ページ非表示時のリソース解放
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handlePageHidden();
            }
        });
        
        // アンロード時のクリーンアップ
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
    }
    
    /**
     * ページ非表示時の処理
     */
    handlePageHidden() {
        console.log('Page hidden, releasing non-essential resources');
        
        // 非必須リソースの解放
        for (const [type, pool] of this.resourcePools) {
            if (type !== 'particles') { // パーティクル以外を解放
                this.cleanupInactiveResources(type);
            }
        }
    }
    
    /**
     * アンロード前の処理
     */
    handleBeforeUnload() {
        console.log('Page unloading, performing final cleanup');
        
        // 全リソースのクリーンアップ
        this.destroy();
    }
    
    /**
     * 統計情報の取得
     */
    getStatistics() {
        return {
            ...this.statistics,
            poolSizes: Object.fromEntries(
                Array.from(this.resourcePools.entries()).map(([type, pool]) => [
                    type, 
                    { total: pool.pool.length, active: pool.active, maxSize: pool.maxSize }
                ])
            ),
            cacheSizes: Object.fromEntries(
                Array.from(this.caches.entries()).map(([type, cache]) => [type, cache.size])
            ),
            memoryUsage: this.getCurrentMemoryUsage(),
            dataUsage: {
                transferred: this.statistics.dataTransferred,
                limit: this.networkSettings.dataUsageLimit,
                remaining: Math.max(0, this.networkSettings.dataUsageLimit - this.networkSettings.dataUsageCount)
            }
        };
    }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
        if (newSettings.memory) {
            Object.assign(this.memorySettings, newSettings.memory);
        }
        
        if (newSettings.network) {
            Object.assign(this.networkSettings, newSettings.network);
        }
        
        console.log('Resource manager settings updated');
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        return {
            component: 'MobileResourceManager',
            state: { ...this.state },
            settings: {
                memory: { ...this.memorySettings },
                network: { ...this.networkSettings }
            },
            statistics: this.getStatistics(),
            resourcePools: Object.fromEntries(this.resourcePools),
            cacheStatus: Object.fromEntries(
                Array.from(this.caches.entries()).map(([type, cache]) => [
                    type, 
                    { size: cache.size, maxSize: this.getMaxCacheSize(type) }
                ])
            )
        };
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying MobileResourceManager...');
        
        // 全リソースのクリーンアップ
        for (const [type, pool] of this.resourcePools) {
            pool.pool.forEach(resource => this.cleanupResource(resource));
            pool.pool.length = 0;
            pool.active = 0;
        }
        
        // キャッシュのクリア
        for (const cache of this.caches.values()) {
            cache.clear();
        }
        
        // イベントリスナーの削除
        window.removeEventListener('memory-pressure', this.handleLowMemory);
        document.removeEventListener('visibilitychange', this.handlePageHidden);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        this.state.initialized = false;
        console.log('MobileResourceManager destroyed');
    }
}