/**
 * Cache Data Loader Component
 * 
 * 音響データの段階的読み込み機能を担当
 * AudioCacheManager のサブコンポーネント
 */

import { getErrorHandler } from '../../utils/ErrorHandler.js';

export class CacheDataLoader {
    constructor(mainController) {
        this.mainController = mainController;
        this.audioContext = mainController.audioContext;
        this.cacheSettings = mainController.cacheSettings;
        
        // 段階的読み込み管理
        this.lazyLoadManager = {
            activeLoads: new Map(),
            chunkIndex: new Map(),
            preloadQueue: []
        };
        
        // パフォーマンス統計
        this.performanceStats = {
            cacheHits: 0,
            cacheMisses: 0,
            loadTimes: []
        };
    }
    
    /**
     * AudioBufferをキャッシュから取得
     * @param {string} key - キー
     * @returns {AudioBuffer|null} AudioBuffer
     */
    getAudioBuffer(key) {
        try {
            const startTime = performance.now();
            const cacheEntry = this.mainController.audioBufferCache.get(key);
            
            if (cacheEntry) {
                this.performanceStats.cacheHits++;
                const loadTime = performance.now() - startTime;
                this.performanceStats.loadTimes.push(loadTime);
                
                console.log(`Cache hit: ${key} (${loadTime.toFixed(2)}ms)`);
                return cacheEntry.buffer;
            }
            
            this.performanceStats.cacheMisses++;
            console.log(`Cache miss: ${key}`);
            return null;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'getAudioBuffer',
                key: key,
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * AudioBufferを段階的に読み込み
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     */
    async getLazyAudioBuffer(key, loadFunction, options = {}) {
        try {
            // キャッシュから確認
            const cachedBuffer = this.getAudioBuffer(key);
            if (cachedBuffer) {
                return cachedBuffer;
            }
            
            // 段階的読み込みが有効な場合
            if (this.cacheSettings.lazyLoading.enabled) {
                return await this.performLazyLoad(key, loadFunction, options);
            }
            
            // 通常の読み込み
            const buffer = await loadFunction();
            if (buffer) {
                this.mainController.setAudioBuffer(key, buffer);
            }
            
            return buffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'getLazyAudioBuffer',
                key: key,
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * 段階的読み込みを実行
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     */
    async performLazyLoad(key, loadFunction, options) {
        try {
            console.log(`Starting lazy load for: ${key}`);
            
            // 既にアクティブな読み込みがあるかチェック
            if (this.lazyLoadManager.activeLoads.has(key)) {
                return await this.lazyLoadManager.activeLoads.get(key);
            }
            
            // 読み込みプロミスを作成
            const loadPromise = this.executeLazyLoad(key, loadFunction, options);
            this.lazyLoadManager.activeLoads.set(key, loadPromise);
            
            try {
                const result = await loadPromise;
                return result;
            } finally {
                this.lazyLoadManager.activeLoads.delete(key);
            }
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'performLazyLoad',
                key: key,
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * 段階的読み込みを実行
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     * @returns {Promise<AudioBuffer>} AudioBuffer
     */
    async executeLazyLoad(key, loadFunction, options) {
        try {
            const chunkSize = options.chunkSize || this.cacheSettings.lazyLoading.chunkSize;
            
            // まずメタデータを読み込み
            const metadata = await this.loadAudioMetadata(loadFunction);
            if (!metadata) {
                throw new Error('Failed to load audio metadata');
            }
            
            // 全体のAudioBufferを作成
            const fullBuffer = this.audioContext.createBuffer(
                metadata.numberOfChannels,
                metadata.length,
                metadata.sampleRate
            );
            
            // チャンクに分割して読み込み
            const totalChunks = Math.ceil(metadata.length / chunkSize);
            const chunks = [];
            
            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const startSample = chunkIndex * chunkSize;
                const endSample = Math.min(startSample + chunkSize, metadata.length);
                
                const chunkKey = `${key}_chunk_${chunkIndex}`;
                
                // チャンクがキャッシュにあるかチェック
                let chunkData = this.mainController.chunkCache.get(chunkKey);
                
                if (!chunkData) {
                    // チャンクを読み込み
                    chunkData = await this.loadAudioChunk(
                        loadFunction, 
                        startSample, 
                        endSample - startSample,
                        metadata
                    );
                    
                    if (chunkData) {
                        // チャンクをキャッシュに保存
                        const chunkSize = chunkData.length * metadata.numberOfChannels * 4;
                        this.mainController.chunkCache.set(chunkKey, chunkData, chunkSize);
                    }
                }
                
                if (chunkData) {
                    chunks.push({ index: chunkIndex, data: chunkData, start: startSample });
                }
            }
            
            // チャンクを組み合わせて完全なバッファを作成
            this.assembleChunksIntoBuffer(fullBuffer, chunks, metadata);
            
            // 完成したバッファをキャッシュに保存
            this.mainController.setAudioBuffer(key, fullBuffer, metadata);
            
            console.log(`Lazy load completed for: ${key} (${chunks.length} chunks)`);
            return fullBuffer;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'executeLazyLoad',
                key: key,
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * 音響メタデータを読み込み
     * @param {Function} loadFunction - 読み込み関数
     * @returns {Promise<Object>} メタデータ
     */
    async loadAudioMetadata(loadFunction) {
        try {
            // 実際の実装では、loadFunctionから部分的なデータを読み込んでメタデータを抽出
            // ここでは簡略化して全体を読み込んでメタデータを取得
            const buffer = await loadFunction();
            if (!buffer) {
                return null;
            }
            
            return {
                numberOfChannels: buffer.numberOfChannels,
                length: buffer.length,
                sampleRate: buffer.sampleRate,
                duration: buffer.duration
            };
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'loadAudioMetadata',
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * 音響チャンクを読み込み
     * @param {Function} loadFunction - 読み込み関数
     * @param {number} startSample - 開始サンプル
     * @param {number} sampleCount - サンプル数
     * @param {Object} metadata - メタデータ
     * @returns {Promise<Float32Array[]>} チャンクデータ
     */
    async loadAudioChunk(loadFunction, startSample, sampleCount, metadata) {
        try {
            // 実際の実装では、範囲指定でデータを読み込む
            // ここでは全体を読み込んで指定範囲を抽出
            const fullBuffer = await loadFunction();
            if (!fullBuffer) {
                return null;
            }
            
            const channels = [];
            for (let channel = 0; channel < metadata.numberOfChannels; channel++) {
                const fullChannelData = fullBuffer.getChannelData(channel);
                const chunkData = fullChannelData.slice(startSample, startSample + sampleCount);
                channels.push(chunkData);
            }
            
            return channels;
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'loadAudioChunk',
                startSample: startSample,
                sampleCount: sampleCount,
                component: 'CacheDataLoader'
            });
            return null;
        }
    }
    
    /**
     * チャンクをバッファに組み立て
     * @param {AudioBuffer} buffer - 出力バッファ
     * @param {Array} chunks - チャンク配列
     * @param {Object} metadata - メタデータ
     */
    assembleChunksIntoBuffer(buffer, chunks, metadata) {
        try {
            chunks.forEach(chunk => {
                const { data, start } = chunk;
                
                for (let channel = 0; channel < metadata.numberOfChannels; channel++) {
                    const bufferChannelData = buffer.getChannelData(channel);
                    const chunkChannelData = data[channel];
                    
                    for (let i = 0; i < chunkChannelData.length; i++) {
                        bufferChannelData[start + i] = chunkChannelData[i];
                    }
                }
            });
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'assembleChunksIntoBuffer',
                component: 'CacheDataLoader'
            });
        }
    }
    
    /**
     * プリロードキューの管理
     * @param {string} key - キー
     * @param {Function} loadFunction - 読み込み関数
     * @param {Object} options - オプション
     */
    addToPreloadQueue(key, loadFunction, options = {}) {
        this.lazyLoadManager.preloadQueue.push({
            key,
            loadFunction,
            options,
            priority: options.priority || 0,
            timestamp: Date.now()
        });
        
        // 優先度順にソート
        this.lazyLoadManager.preloadQueue.sort((a, b) => b.priority - a.priority);
    }
    
    /**
     * プリロードキューを処理
     * @param {number} maxConcurrent - 最大同時実行数
     */
    async processPreloadQueue(maxConcurrent = 3) {
        const activePromises = [];
        
        while (this.lazyLoadManager.preloadQueue.length > 0 && activePromises.length < maxConcurrent) {
            const item = this.lazyLoadManager.preloadQueue.shift();
            
            const promise = this.getLazyAudioBuffer(item.key, item.loadFunction, item.options)
                .then(() => {
                    console.log(`Preload completed: ${item.key}`);
                })
                .catch(error => {
                    console.warn(`Preload failed: ${item.key}`, error);
                });
            
            activePromises.push(promise);
        }
        
        if (activePromises.length > 0) {
            await Promise.allSettled(activePromises);
        }
    }
    
    /**
     * 平均読み込み時間を計算
     * @returns {number} 平均読み込み時間（ミリ秒）
     */
    calculateAverageLoadTime() {
        const loadTimes = this.performanceStats.loadTimes;
        if (loadTimes.length === 0) {
            return 0;
        }
        
        const sum = loadTimes.reduce((acc, time) => acc + time, 0);
        return sum / loadTimes.length;
    }
    
    /**
     * ローダー統計を取得
     * @returns {Object} ローダー統計
     */
    getLoaderStats() {
        return {
            cacheHits: this.performanceStats.cacheHits,
            cacheMisses: this.performanceStats.cacheMisses,
            averageLoadTime: this.calculateAverageLoadTime(),
            activeLoads: this.lazyLoadManager.activeLoads.size,
            preloadQueueSize: this.lazyLoadManager.preloadQueue.length,
            hitRate: this.performanceStats.cacheHits + this.performanceStats.cacheMisses > 0 
                ? this.performanceStats.cacheHits / (this.performanceStats.cacheHits + this.performanceStats.cacheMisses)
                : 0
        };
    }
    
    /**
     * リソースの解放
     */
    dispose() {
        try {
            this.lazyLoadManager.activeLoads.clear();
            this.lazyLoadManager.chunkIndex.clear();
            this.lazyLoadManager.preloadQueue = [];
            this.performanceStats.loadTimes = [];
            
            console.log('CacheDataLoader disposed');
        } catch (error) {
            getErrorHandler().handleError(error, 'AUDIO_CACHE_ERROR', {
                operation: 'dispose',
                component: 'CacheDataLoader'
            });
        }
    }
}