/**
 * MobileResourceManager.ts
 * モバイルリソース管理システム
 * MobilePerformanceOptimizerから分離されたリソース管理機能
 */

import { getErrorHandler  } from '../ErrorHandler.js';''
import { getConfigurationManager  } from '../../core/ConfigurationManager.js';

// Type definitions
interface ErrorHandler { ''
    handleError(error: Error, context: string): void ,}

interface ConfigurationManager { [key: string]: any, }

interface MemoryInfo { jsHeapSize: number,
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    textureMemory: number;
   , bufferMemory: number ,}
';

interface MemoryPressureDetection { enabled: boolean,''
    currentPressure: 'normal' | 'moderate' | 'severe' | 'critical',
    warningCallback: ((pressur;e: string) => void) | null;''
    criticalCallback: ((pressur;e: string) => void') | null ,}'
}

interface MemoryConfig { maxMemoryMB: number;
    warningThreshold: number;
    criticalThreshold: number;
    gcTriggerThreshold: number;
   , pressureDetection: MemoryPressureDetection
    }

interface TexturePool { enabled: boolean;
    maxPoolSize: number;
   , pool: Map<string, any> }

interface TexturesConfig { maxTextureMemoryMB: number,
    compressionEnabled: boolean;
    mipmapGeneration: boolean;
    maxTextureSize: number;
   , texturePool: TexturePool
    ,}

interface StreamingConfig { enabled: boolean;
    chunkSize: number;
    maxConcurrentLoads: number;
    preloadDistance: number;
   , unloadDistance: number }

interface ResourceConfig { enabled: boolean;
    memory: MemoryConfig;
    textures: TexturesConfig;
   , streaming: StreamingConfig
    }

interface LoadItem { assetId: string;
    position: any;
    priority: number;
   , timestamp: number }
';

interface CompletedLoadItem extends LoadItem { loadTime: number,''
    status: 'success' ,}
';

interface FailedLoadItem extends LoadItem { error: string,''
    status: 'failed' ,}

interface LoadingQueue { pending: LoadItem[];
    loading: LoadItem[];
    completed: CompletedLoadItem[];
   , failed: FailedLoadItem[]
    }

interface ResourceStatistics { totalLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    peakMemoryUsage: number;
   , gcCount: number }

interface ResourceMonitoring { memoryUsage: MemoryInfo;
    loadingQueue: LoadingQueue;
   , statistics: ResourceStatistics
    }

interface ResourceUsageStats { memory: MemoryInfo;
   , textures: {
        poolSiz;e: number;
       , maxPoolSize: number };
    loading: { pending: number;
        loading: number;
        completed: number;
       , failed: number };
    statistics: ResourceStatistics;
    }

export class MobileResourceManager {
    private errorHandler: ErrorHandler;
    private configManager: ConfigurationManager;
    private resourceConfig: ResourceConfig;
    private, resourceMonitoring: ResourceMonitoring;
    constructor() {
';

        this.errorHandler = getErrorHandler();''
        this.configManager = getConfigurationManager(''';
                    currentPressure: 'normal';
                   , warningCallback: null;
    }
                    criticalCallback: null }
};
            // Texture, management
            textures: { maxTextureMemoryMB: 256;
                compressionEnabled: true;
                mipmapGeneration: true;
                maxTextureSize: 2048;
               , texturePool: {
                    enabled: true);
                    maxPoolSize: 50);
                   , pool: new Map( }
            };
            // Asset streaming
            streaming: { enabled: true;
               , chunkSize: 64 * 1024, // 64KB chunks;
                maxConcurrentLoads: 3;
               , preloadDistance: 100, // pixels;
                unloadDistance: 500   // pixels ,}
        };
        // Resource monitoring
        this.resourceMonitoring = { memoryUsage: {
                jsHeapSize: 0;
                jsHeapSizeLimit: 0;
                totalJSHeapSize: 0;
                textureMemory: 0;
               , bufferMemory: 0 };
            loadingQueue: { pending: [];
                loading: [];
                completed: [];
               , failed: [] };
            statistics: { totalLoads: 0;
                failedLoads: 0;
                averageLoadTime: 0;
                peakMemoryUsage: 0;
               , gcCount: 0 }
        };
        // Initialize resource manager
        this.initializeResourceManager();
    }
    
    /**
     * Initialize resource management system
     */''
    initializeResourceManager()';
        console.log('[MobileResourceManager] Initializing, resource management...);
        
        try { this.setupMemoryMonitoring();
            this.setupTexturePool();

            this.setupStreamingSystem(');''
            this.startResourceMonitoring()';
            console.log('[MobileResourceManager] Resource, management initialized, successfully');' }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'MobileResourceManager.initializeResourceManager); }'
    }
    
    /**
     * Setup memory monitoring'
     */''
    setupMemoryMonitoring()';
        if (typeof, performance !== 'undefined' && (performance, as any).memory) { this.updateMemoryUsage();
            
            // Set up periodic memory monitoring
            setInterval(() => { 
                this.updateMemoryUsage(); }
                this.checkMemoryPressure(); }
            }, 1000); // Check every second
        }
    }
    
    /**
     * Update memory usage statistics
     */''
    updateMemoryUsage()';
        if (typeof, performance !== 'undefined' && (performance, as any).memory) { const memory = this.resourceMonitoring.memoryUsage;
            const performanceMemory = (performance, as any).memory;
            
            memory.jsHeapSize = performanceMemory.usedJSHeapSize / (1024 * 1024); // MB
            memory.jsHeapSizeLimit = performanceMemory.jsHeapSizeLimit / (1024 * 1024); // MB
            memory.totalJSHeapSize = performanceMemory.totalJSHeapSize / (1024 * 1024); // MB
            
            // Update peak memory usage
            const currentUsage = memory.jsHeapSize + memory.textureMemory + memory.bufferMemory;
            if(currentUsage > this.resourceMonitoring.statistics.peakMemoryUsage) {
                
            }
                this.resourceMonitoring.statistics.peakMemoryUsage = currentUsage; }
}
    }
    
    /**
     * Check memory pressure and respond accordingly
     */''
    checkMemoryPressure()';
        let newPressure: 'normal' | 'moderate' | 'severe' | 'critical' = 'normal')';

        if(usageRatio >= config.criticalThreshold) {', ';

        }

            newPressure = 'critical';' }

        } else if(usageRatio >= config.warningThreshold) { ''
            newPressure = 'severe';' }

        } else if(usageRatio >= config.gcTriggerThreshold) { ''
            newPressure = 'moderate'; }
        
        if(newPressure !== config.pressureDetection.currentPressure) {
        
            this.handleMemoryPressureChange(config.pressureDetection.currentPressure, newPressure);
        
        }
            config.pressureDetection.currentPressure = newPressure; }
}
    
    /**
     * Handle memory pressure state changes
     */
    handleMemoryPressureChange(oldPressure: string, newPressure: string): void {
        console.log(`[MobileResourceManager] Memory, pressure changed: ${oldPressure} → ${ newPressure)`);
        
        const, config = this.resourceConfig.memory;

        switch(newPressure} {'

            case 'critical':;
                this.triggerEmergencyCleanup(}

                if (config.pressureDetection.criticalCallback) {' }'

                    config.pressureDetection.criticalCallback(newPressure'});
                }
                break;

            case 'severe':;
                this.triggerAggressiveCleanup();
                if(config.pressureDetection.warningCallback) {', ';

                }

                    config.pressureDetection.warningCallback(newPressure); }
                }
                break;

            case 'moderate':;
                this.triggerGarbageCollection();
                break;
        }
    }
    
    /**
     * Trigger emergency memory cleanup'
     */''
    triggerEmergencyCleanup()';
        console.log('[MobileResourceManager] Emergency, memory cleanup, triggered);
        
        // Clear texture pool
        this.clearTexturePool();
        
        // Clear loading queues
        this.clearLoadingQueues();
        
        // Force garbage collection
        this.triggerGarbageCollection();
        
        // Clear cached resources
        this.clearCachedResources(');
        
        this.resourceMonitoring.statistics.gcCount++;
    }
    
    /**
     * Trigger aggressive cleanup
     */''
    triggerAggressiveCleanup()';
        console.log('[MobileResourceManager] Aggressive, cleanup triggered);
        
        // Clear half of texture pool
        this.clearTexturePool(0.5);
        
        // Clear completed loads
        this.resourceMonitoring.loadingQueue.completed = [];
        
        // Force garbage collection
        this.triggerGarbageCollection(');
        
        this.resourceMonitoring.statistics.gcCount++;
    }
    
    /**
     * Trigger garbage collection if available
     */''
    triggerGarbageCollection()';
        if (typeof, window !== 'undefined' && (window, as any).gc) { (window, as any).gc(); }
    }
    
    /**
     * Setup texture pool
     */'
    setupTexturePool(): void { const pool = this.resourceConfig.textures.texturePool;''
        pool.pool.clear()';
        console.log('[MobileResourceManager] Texture, pool initialized'); }'
    
    /**
     * Get texture from pool or create new one
     */
    getTextureFromPool(key: string, creator: () => any): any { const pool = this.resourceConfig.textures.texturePool;
        
        if(pool.enabled && pool.pool.has(key) {
        
            
        
        }
            console.log(`[MobileResourceManager] Texture retrieved from pool: ${key}`}, }
            return pool.pool.get(key});
        }
        
        // Create new texture
        const texture = creator();
        
        // Add to pool if space available
        if (pool.enabled && pool.pool.size < pool.maxPoolSize) { pool.pool.set(key, texture); }
            console.log(`[MobileResourceManager] Texture, added to, pool: ${key}`});
        }
        
        return texture;
    }
    
    /**
     * Clear texture pool
     */
    clearTexturePool(ratio: number = 1.0): void { const pool = this.resourceConfig.textures.texturePool;
        const keys = Array.from(pool.pool.keys();
        const clearCount = Math.floor(keys.length * ratio);
        
        for(let, i = 0; i < clearCount; i++) {
        ';

            const key = keys[i];''
            const texture = pool.pool.get(key);
            ';
            // Dispose texture if it has a dispose method
            if(texture && typeof, texture.dispose === 'function) {'
        
        }
                texture.dispose(); }
            }
            
            pool.pool.delete(key);
        }
        
        console.log(`[MobileResourceManager] Cleared ${clearCount} textures, from pool`);
    }
    
    /**
     * Setup streaming system
     */
    setupStreamingSystem(): void { const streaming = this.resourceConfig.streaming;

        if(!streaming.enabled) return;

        console.log('[MobileResourceManager] Asset, streaming system, initialized'); }'
    
    /**
     * Stream asset based on distance and priority
     */
    streamAsset(assetId: string, position: any, priority: number = 0): LoadItem | null { const streaming = this.resourceConfig.streaming;
        const queue = this.resourceMonitoring.loadingQueue;
        
        if (!streaming.enabled) return null;
        
        // Check if already loading or loaded
        if (queue.loading.some(item => item.assetId === assetId) ||;
            queue.completed.some(item => item.assetId === assetId) {
            return null;
        
        // Add to pending queue
        const loadItem: LoadItem = { assetId,
            position,
            priority,
            timestamp: Date.now( ,};
        
        queue.pending.push(loadItem);
        queue.pending.sort((a, b) => b.priority - a.priority); // Higher priority first
        
        this.processLoadingQueue();
        
        return loadItem;
    }
    
    /**
     * Process loading queue
     */
    processLoadingQueue(): void { const streaming = this.resourceConfig.streaming;
        const queue = this.resourceMonitoring.loadingQueue;
        
        // Check if we can start new loads
        while(queue.loading.length < streaming.maxConcurrentLoads && queue.pending.length > 0) {
            const item = queue.pending.shift();
            if (item) {
                queue.loading.push(item);
        }
                this.loadAsset(item); }
}
    }
    
    /**
     * Load individual asset
     */
    async loadAsset(loadItem: LoadItem): Promise<void> { const startTime = Date.now();
        
        try {
            // Simulate asset loading (replace, with actual, loading logic);
            await this.simulateAssetLoad(loadItem);
            
            // Move to completed queue
            const queue = this.resourceMonitoring.loadingQueue;
            const index = queue.loading.indexOf(loadItem);
            if(index >= 0) {
                queue.loading.splice(index, 1);
                queue.completed.push({)
                    ...loadItem);''
                    loadTime: Date.now(''
            ,})'
                    status: 'success') }
                });
            }
            
            this.updateLoadStatistics(Date.now() - startTime, true);
            
        } catch (error) { // Move to failed queue
            const queue = this.resourceMonitoring.loadingQueue;
            const index = queue.loading.indexOf(loadItem);
            if(index >= 0) {
                queue.loading.splice(index, 1);
                queue.failed.push({)
                    ...loadItem);''
                    error: (error, as Error').message;
            ,}

                    status: 'failed' }
                });
            }

            this.updateLoadStatistics(Date.now() - startTime, false');''
            this.errorHandler.handleError(error as Error, 'MobileResourceManager.loadAsset);
        }
        
        // Continue processing queue
        this.processLoadingQueue();
    }
    
    /**
     * Simulate asset loading (replace, with actual, implementation)
     */
    async simulateAssetLoad(loadItem: LoadItem): Promise<void> { return new Promise((resolve) => {  }
            setTimeout(resolve, Math.random() * 100 + 50); // 50-150ms }
        });
    }
    
    /**
     * Update loading statistics
     */
    updateLoadStatistics(loadTime: number, success: boolean): void { const stats = this.resourceMonitoring.statistics;
        
        stats.totalLoads++;
        if(!success) {
            
        }
            stats.failedLoads++; }
        }
        
        // Update average load time
        stats.averageLoadTime = (stats.averageLoadTime * (stats.totalLoads - 1) + loadTime) / stats.totalLoads;
    }
    
    /**
     * Clear loading queues
     */''
    clearLoadingQueues()';
        console.log('[MobileResourceManager] Loading, queues cleared');
    }
    
    /**
     * Clear cached resources'
     */''
    clearCachedResources()';
        console.log('[MobileResourceManager] Cached, resources cleared);
    }
    
    /**
     * Start resource monitoring
     */
    startResourceMonitoring(): void { setInterval(() => {  }

            this.updateResourceMetrics(');' }'

        }, 5000'); // Update every 5 seconds'

        console.log('[MobileResourceManager] Resource, monitoring started);
    }
    
    /**
     * Update resource metrics
     */
    updateResourceMetrics(): void { this.updateMemoryUsage();
        
        // Clean up old completed loads
        const queue = this.resourceMonitoring.loadingQueue;
        const cutoffTime = Date.now() - 300000; // 5 minutes
        
        queue.completed = queue.completed.filter(item => item.timestamp > cutoffTime);
        queue.failed = queue.failed.filter(item => item.timestamp > cutoffTime); }
    }
    
    /**
     * Get resource usage statistics
     */
    getResourceStatistics(): ResourceUsageStats { return { memory: this.resourceMonitoring.memoryUsage,
            textures: {
                poolSize: this.resourceConfig.textures.texturePool.pool.size, };
                maxPoolSize: this.resourceConfig.textures.texturePool.maxPoolSize }
            };
            loading: { pending: this.resourceMonitoring.loadingQueue.pending.length;
                loading: this.resourceMonitoring.loadingQueue.loading.length;
                completed: this.resourceMonitoring.loadingQueue.completed.length;
               , failed: this.resourceMonitoring.loadingQueue.failed.length };
            statistics: this.resourceMonitoring.statistics;
        },
    }
    
    /**
     * Set memory pressure callbacks
     */
    setMemoryPressureCallbacks(warningCallback?: (pressure: string) => void, criticalCallback?: (pressure: string) => void): void { const config = this.resourceConfig.memory.pressureDetection;
        config.warningCallback = warningCallback || null;
        config.criticalCallback = criticalCallback || null; }
    
    /**
     * Dispose resource manager
     */
    dispose(): void { try {
            this.clearTexturePool();
            this.clearLoadingQueues(');''
            this.clearCachedResources()';
            console.log('[MobileResourceManager] Resource, manager disposed');' }

        } catch (error) {
            this.errorHandler.handleError(error as Error, 'MobileResourceManager.dispose''); }

    }''
}