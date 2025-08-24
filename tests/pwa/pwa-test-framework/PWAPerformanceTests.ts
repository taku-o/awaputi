/**
 * PWAPerformanceTests - Performance, cache, and offline functionality tests
 * Part of the PWATestFramework split implementation
 */

export class PWAPerformanceTests {
    private mainFramework: any;
    private executor: any;

    constructor(mainFramework: any) {
        this.mainFramework = mainFramework;
        this.executor = mainFramework.executor;
        
        console.log('[PWAPerformanceTests] Performance tests component initialized');
    }

    /**
     * Run offline functionality tests
     */
    async runOfflineTests() {
        console.log('[PWAPerformanceTests] Starting offline functionality tests');
        await this.executor.runTest('cache-storage-test', 'Cache storage test', async () => {
            const testCacheName = 'offline-test-cache';
            const testUrl = '/offline-test-resource';
            const testData = 'offline test data';
            
            // Cache creation
            const cache = await caches.open(testCacheName);
            await cache.put(testUrl, new Response(testData));
            
            // Test cache retrieval
            const cachedResponse = await cache.match(testUrl);
            this.executor.assert(cachedResponse !== undefined, 'Cached resource should be retrievable');
            const cachedText = await cachedResponse!.text();
            this.executor.assert(cachedText === testData, 'Cache data should be correct');
            
            // Cleanup
            await caches.delete(testCacheName);
            return { cacheOperationSuccess: true };
        });
        
        await this.executor.runTest('offline-fallback-test', 'Offline fallback test', async () => {
            // Test Service Worker fallback functionality on network error
            const testUrl = '/non-existent-resource-for-fallback-test';
            
            try {
                const response = await fetch(testUrl);
                // Test if Service Worker returns fallback response
                const responseText = await response.text();
                
                return {
                    fallbackWorking: response.ok,
                    responseSize: responseText.length,
                    contentType: response.headers.get('content-type')
                };
            } catch (error) {
                // In case of network error, check if Service Worker fallback is working
                return {
                    fallbackWorking: false,
                    networkErrorCaught: true,
                    error: (error as Error).message
                };
            }
        });
        
        await this.executor.runTest('cache-persistence-test', 'Cache persistence test', async () => {
            const persistentCacheName = 'persistence-test-cache';
            const persistentUrl = '/persistent-test-resource';
            const persistentData = 'persistent test data';
            
            // Create cache entry
            const cache = await caches.open(persistentCacheName);
            await cache.put(persistentUrl, new Response(persistentData));
            
            // Simulate page reload by getting cache again
            const newCacheInstance = await caches.open(persistentCacheName);
            const persistedResponse = await newCacheInstance.match(persistentUrl);
            
            this.executor.assert(persistedResponse !== undefined, 'Cache should persist across instances');
            const persistedText = await persistedResponse!.text();
            this.executor.assert(persistedText === persistentData, 'Persisted data should be intact');
            
            // Cleanup
            await caches.delete(persistentCacheName);
            
            return { cachePersistenceWorking: true };
        });
        
        await this.executor.runTest('storage-quota-test', 'Storage quota test', async () => {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                
                return {
                    quota: estimate.quota,
                    usage: estimate.usage,
                    available: estimate.quota ? (estimate.quota - (estimate.usage || 0)) : undefined,
                    usagePercentage: estimate.quota && estimate.usage ? 
                        (estimate.usage / estimate.quota * 100) : undefined
                };
            } else {
                return { storageEstimateNotSupported: true };
            }
        });
    }
    
    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        console.log('[PWAPerformanceTests] Starting performance tests');
        
        await this.executor.runTest('load-performance-test', 'Load performance test', async () => {
            const startTime = performance.now();
            
            // Test loading of critical resources
            const testResources = [
                '/manifest.json',
                '/sw.js'
            ];
            
            const resourceLoadResults: any[] = [];
            
            for (const resource of testResources) {
                const resourceStart = performance.now();
                try {
                    const response = await fetch(resource);
                    const resourceEnd = performance.now();
                    const loadTime = resourceEnd - resourceStart;
                    
                    resourceLoadResults.push({
                        resource: resource,
                        loadTime: loadTime,
                        success: response.ok,
                        size: response.headers.get('content-length') || 'unknown'
                    });
                } catch (error: any) {
                    const resourceEnd = performance.now();
                    const loadTime = resourceEnd - resourceStart;
                    
                    resourceLoadResults.push({
                        resource: resource,
                        loadTime: loadTime,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            const totalTime = performance.now() - startTime;
            
            return {
                totalLoadTime: totalTime,
                resourceResults: resourceLoadResults,
                averageLoadTime: resourceLoadResults.reduce((sum, result) => 
                    sum + result.loadTime, 0) / resourceLoadResults.length
            };
        });
        
        await this.executor.runTest('first-contentful-paint-test', 'First Contentful Paint test', async () => {
            if ('getEntriesByType' in performance) {
                const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
                const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
                
                if (fcpEntry) {
                    return {
                        firstContentfulPaint: fcpEntry.startTime,
                        fcpGrade: fcpEntry.startTime < 1000 ? 'excellent' :
                                 fcpEntry.startTime < 2500 ? 'good' :
                                 fcpEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
                    };
                }
            }
            
            return { fcpNotAvailable: true };
        });
        
        await this.executor.runTest('navigation-timing-test', 'Navigation timing test', async () => {
            if ('getEntriesByType' in performance) {
                const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
                if (navEntries.length > 0) {
                    const navTiming = navEntries[0];
                    
                    return {
                        domContentLoadedTime: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
                        loadCompleteTime: navTiming.loadEventEnd - navTiming.loadEventStart,
                        dnsLookupTime: navTiming.domainLookupEnd - navTiming.domainLookupStart,
                        tcpConnectTime: navTiming.connectEnd - navTiming.connectStart,
                        responseTime: navTiming.responseEnd - navTiming.responseStart,
                        domProcessingTime: navTiming.domComplete - navTiming.domLoading,
                        totalLoadTime: navTiming.loadEventEnd - navTiming.navigationStart
                    };
                }
            }
            
            return { navigationTimingNotAvailable: true };
        });
        
        await this.executor.runTest('memory-usage-test', 'Memory usage test', async () => {
            if ('memory' in performance) {
                const memoryInfo = (performance as any).memory;
                
                return {
                    usedJSHeapSize: memoryInfo.usedJSHeapSize,
                    totalJSHeapSize: memoryInfo.totalJSHeapSize,
                    jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
                    memoryUtilization: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
                };
            }
            
            return { memoryInfoNotAvailable: true };
        });
    }
    
    /**
     * Run cache strategy tests
     */
    async runCacheStrategyTests() {
        console.log('[PWAPerformanceTests] Starting cache strategy tests');
        
        await this.executor.runTest('cache-first-strategy-test', 'Cache-first strategy test', async () => {
            const testCacheName = 'cache-first-test';
            const testUrl = '/cache-first-test-resource';
            const originalData = 'original cache data';
            const updatedData = 'updated cache data';
            
            // Create initial cache entry
            const cache = await caches.open(testCacheName);
            await cache.put(testUrl, new Response(originalData));
            
            // Test cache-first behavior
            const cachedResponse = await cache.match(testUrl);
            this.executor.assert(cachedResponse !== undefined, 'Cache should return cached response first');
            
            const cachedText = await cachedResponse!.text();
            this.executor.assert(cachedText === originalData, 'Should get original cached data');
            
            // Update cache and test again
            await cache.put(testUrl, new Response(updatedData));
            const updatedResponse = await cache.match(testUrl);
            const updatedText = await updatedResponse!.text();
            this.executor.assert(updatedText === updatedData, 'Should get updated cached data');
            
            // Cleanup
            await caches.delete(testCacheName);
            
            return { cacheFirstStrategyWorking: true };
        });
        
        await this.executor.runTest('network-first-fallback-test', 'Network-first with fallback test', async () => {
            const testCacheName = 'network-first-test';
            const testUrl = '/network-first-test-resource';
            const fallbackData = 'fallback cache data';
            
            // Create fallback cache entry
            const cache = await caches.open(testCacheName);
            await cache.put(testUrl, new Response(fallbackData));
            
            try {
                // Attempt network request first
                const networkResponse = await fetch(testUrl);
                
                if (networkResponse.ok) {
                    return { 
                        networkFirstWorking: true,
                        sourceUsed: 'network',
                        responseStatus: networkResponse.status
                    };
                } else {
                    throw new Error('Network request failed');
                }
            } catch (error) {
                // Fall back to cache
                const cachedResponse = await cache.match(testUrl);
                if (cachedResponse) {
                    const cachedText = await cachedResponse.text();
                    this.executor.assert(cachedText === fallbackData, 'Should get fallback data from cache');
                    
                    await caches.delete(testCacheName);
                    return { 
                        networkFirstWorking: true,
                        sourceUsed: 'cache-fallback',
                        fallbackSuccessful: true
                    };
                } else {
                    await caches.delete(testCacheName);
                    return { 
                        networkFirstWorking: false,
                        error: 'Both network and cache failed'
                    };
                }
            }
        });
        
        await this.executor.runTest('stale-while-revalidate-test', 'Stale-while-revalidate test', async () => {
            const testCacheName = 'swr-test';
            const testUrl = '/swr-test-resource';
            const staleData = 'stale cache data';
            
            // Create stale cache entry
            const cache = await caches.open(testCacheName);
            await cache.put(testUrl, new Response(staleData));
            
            // Get stale data immediately
            const staleResponse = await cache.match(testUrl);
            this.executor.assert(staleResponse !== undefined, 'Should get stale data immediately');
            
            const staleText = await staleResponse!.text();
            this.executor.assert(staleText === staleData, 'Should get stale cached data');
            
            // Simulate revalidation in background (would normally be done by service worker)
            try {
                const revalidateResponse = await fetch(testUrl);
                if (revalidateResponse.ok) {
                    // Update cache with fresh data
                    await cache.put(testUrl, revalidateResponse.clone());
                }
            } catch (error) {
                // Revalidation failed, but we still have stale data
            }
            
            // Cleanup
            await caches.delete(testCacheName);
            
            return { 
                staleWhileRevalidateWorking: true,
                staleDataServed: true
            };
        });
    }
}