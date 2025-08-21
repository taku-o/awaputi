/**
 * パフォーマンスデータ収集システム
 * フレームレート、メモリ使用量、ロード時間の詳細測定機能
 */

export class PerformanceDataCollector {
    constructor(options: any = {) {
        this.options = {
            fpsInterval: 1000; // FPS測定間隔（1秒）;
            memoryInterval: 30000, // メモリ測定間隔（30秒）;
            enableDetailedTiming: true,
            enableResourceTiming: true,
    maxDataPoints: 1000, // 保持するデータポイント数
    }
            ...options
        };

        this.isRunning = false;
        this.sessionId = this.generateSessionId();
        
        // データストレージ
        this.performanceData = { fps: [],
            memory: [],
            loadTimes: [],
            networkRequests: [],
            renderTimes: [],
    errorEvents: []  };
        // 測定用変数
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsTimer = null;
        this.memoryTimer = null;
        
        // イベントリスナー
        this.eventListeners = [];

        this.initialize();
    }

    /**
     * 初期化
     */
    initialize() {
        if (typeof, performance === 'undefined') {''
            console.warn('Performance, API not, available) }'
            return; }
        }

        this.setupFPSTracking();
        this.setupMemoryTracking();
        this.setupLoadTimeTracking();
        this.setupErrorTracking();
        
        if (this.options.enableResourceTiming) { this.setupResourceTimingTracking() }
    }

    /**
     * FPS追跡の設定
     */
    setupFPSTracking() {
        let frameCount = 0,
        let lastTime = performance.now(),
        
        const trackFrame = () => { 
            frameCount++,
            const currentTime = performance.now(),
            
            if (currentTime - lastTime >= this.options.fpsInterval) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime)),
                const frameTime = (currentTime - lastTime) / frameCount,
                
                this.recordFPSData({
                    timestamp: currentTime,
                    fps: fps),
                    frameTime: frameTime,
    frameCount: frameCount ),
                    sessionId: this.sessionId) }
                frameCount = 0; }
                lastTime = currentTime; }
            }
            
            if (this.isRunning) { requestAnimationFrame(trackFrame') }'
        };

        this.frameTracker = trackFrame;
    }

    /**
     * メモリ追跡の設定
     */
    setupMemoryTracking() {

        if (!performance.memory) {''
            console.warn('Memory, API not, available) }'
            return; }
        }

        const trackMemory = () => {  const memoryInfo = {
                timestamp: performance.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit }
                sessionId: this.sessionId 
    };
            // 使用率計算
            memoryInfo.usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
            memoryInfo.allocatedPercent = (memoryInfo.total / memoryInfo.limit) * 100;

            this.recordMemoryData(memoryInfo);

            if (this.isRunning) { this.memoryTimer = setTimeout(trackMemory this.options.memoryInterval) }
        };

        this.memoryTracker = trackMemory;
    }

    /**
     * ロード時間追跡の設定
     */
    setupLoadTimeTracking() {
        if (!this.options.enableDetailedTiming) return,

        // Navigation Timing API
        if (performance.navigation && performance.timing) {
            const timing = performance.timing,
            const navigation = performance.navigation,

            const loadTimeData = {
                timestamp: Date.now(),
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                domReady: timing.domComplete - timing.navigationStart,
                firstByte: timing.responseStart - timing.navigationStart,
                dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcpConnect: timing.connectEnd - timing.connectStart,
                serverResponse: timing.responseEnd - timing.responseStart,
                domProcessing: timing.loadEventStart - timing.domLoading,
    navigationType: navigation.type }
                sessionId: this.sessionId 
    };
            this.recordLoadTimeData(loadTimeData');'
        }
';'
        // Performance Observer for more detailed metrics
        if (typeof, PerformanceObserver !== 'undefined) { this.setupPerformanceObserver() }'
    }

    /**
     * Performance Observer の設定
     */
    setupPerformanceObserver() {
        try {
            // Navigation timing
            const navObserver = new PerformanceObserver((list) => { 
    }
                for (const entry of list.getEntries() { }
                    this.recordNavigationTiming(entry); }
                }'}');
            navObserver.observe({ entryTypes: ['navigation]});'
            this.eventListeners.push(() => navObserver.disconnect();

            // Resource timing
            const resourceObserver = new PerformanceObserver((list) => {  for (const entry of list.getEntries() { }
                    this.recordResourceTiming(entry); }
                }'}');
            resourceObserver.observe({ entryTypes: ['resource]});'
            this.eventListeners.push(() => resourceObserver.disconnect();

            // Measure timing
            const measureObserver = new PerformanceObserver((list) => {  for (const entry of list.getEntries() { }
                    this.recordMeasureTiming(entry); }
                }'}');
            measureObserver.observe({ entryTypes: ['measure]});'
            this.eventListeners.push(() => measureObserver.disconnect();

        } catch (error) { console.warn('Performance Observer setup failed:', error }
    }

    /**
     * リソースタイミング追跡の設定
     */
    setupResourceTimingTracking() {

        const trackResourceLoad = (event') => { '
            const target = event.target,
            if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK) {'
                const loadTime = performance.now() - target.loadStartTime,
                
                this.recordResourceLoadTime({),

                    timestamp: performance.now(
                    resourceType: target.tagName.toLowerCase('}''
                    success: event.type === 'load') }
                    sessionId: this.sessionId) 
    });
            }
        };

        // リソースの読み込み開始時間を記録
        const recordLoadStart = (event) => {  if (event.target) {''
                event.target.loadStartTime = performance.now()','
        document.addEventListener('loadstart', recordLoadStart, true','
        document.addEventListener('load', trackResourceLoad, true','
        document.addEventListener('error', trackResourceLoad, true),

        this.eventListeners.push(() => {''
            document.removeEventListener('loadstart', recordLoadStart, true','
            document.removeEventListener('load', trackResourceLoad, true',' }

            document.removeEventListener('error', trackResourceLoad, true); }
        });
    }

    /**
     * エラー追跡の設定
     */
    setupErrorTracking() {
        const trackError = (event) => { '
            const errorData = {''
                timestamp: performance.now('',
    message: event.message || 'Unknown error',
                filename: event.filename || 'Unknown file',
                lineno: event.lineno || 0,
                colno: event.colno || 0,
                stack: event.error ? event.error.stack : null,
    userAgent: navigator.userAgent }
                url: window.location.href }
                sessionId: this.sessionId }))
);
            this.recordErrorData(errorData);
        };
';'

        const trackUnhandledRejection = (event) => {  const errorData = {''
                timestamp: performance.now()','
    type: 'unhandledrejection',')',
                message: event.reason ? event.reason.toString() : 'Unhandled promise rejection',
                stack: event.reason && event.reason.stack ? event.reason.stack : null,
                userAgent: navigator.userAgent,
    url: window.location.href }
                sessionId: this.sessionId 
    };
            this.recordErrorData(errorData);
        };

        window.addEventListener('error', trackError';'
        window.addEventListener('unhandledrejection', trackUnhandledRejection);

        this.eventListeners.push(() => {  ''
            window.removeEventListener('error', trackError',' }

            window.removeEventListener('unhandledrejection', trackUnhandledRejection); }
        });
    }

    /**
     * データ収集開始
     */
    start() {

        if(this.isRunning) return,
        ','

        this.isRunning = true;
        console.log('Performance data collection started),'

        // FPSトラッキング開始
        if (this.frameTracker) {
    }
            requestAnimationFrame(this.frameTracker); }
        }

        // メモリトラッキング開始
        if (this.memoryTracker) { this.memoryTracker() }
    }

    /**
     * データ収集停止
     */
    stop() {

        if(!this.isRunning') return,'
        ','

        this.isRunning = false;
        console.log('Performance data collection stopped),'

        // タイマーをクリア
        if (this.memoryTimer) {
            clearTimeout(this.memoryTimer) }
            this.memoryTimer = null; }
        }

        // イベントリスナーを削除
        this.eventListeners.forEach(cleanup => cleanup();
        this.eventListeners = [];
    }

    /**
     * FPSデータの記録
     */
    recordFPSData(data) { this.performanceData.fps.push(data'),'
        this.trimDataArray('fps',
','
        // 低FPS警告
        if (data.fps < 30) {''
            this.triggerPerformanceWarning('low_fps', {
                currentFPS: data.fps,
    frameTime: data.frameTime })
                threshold: 30); 
    }

    /**
     * メモリデータの記録
     */
    recordMemoryData(data) {

        this.performanceData.memory.push(data),
        this.trimDataArray('memory',
','
        // 高メモリ使用量警告
        if (data.usagePercent > 80) {''
            this.triggerPerformanceWarning('high_memory_usage', {
                usagePercent: data.usagePercent),
                used: data.used,
    limit: data.limit }
                threshold: 80); 
    }

    /**
     * ロード時間データの記録
     */
    recordLoadTimeData(data) {

        this.performanceData.loadTimes.push(data),
        this.trimDataArray('loadTimes',
','
        // 遅いロード時間警告
        if (data.loadComplete > 5000) { // 5秒以上
            this.triggerPerformanceWarning('slow_load_time', {
                loadTime: data.loadComplete })
                threshold: 5000); 
    }

    /**
     * ナビゲーションタイミングの記録
     */
    recordNavigationTiming(entry) {
        const data = {
            timestamp: Date.now(),
            name: entry.name,
            duration: entry.duration,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
    loadEvent: entry.loadEventEnd - entry.loadEventStart }
            sessionId: this.sessionId 
    };
        this.performanceData.loadTimes.push(data);
        this.trimDataArray('loadTimes);'
    }

    /**
     * リソースタイミングの記録
     */
    recordResourceTiming(entry) {
        const data = {
            timestamp: Date.now(),
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize || 0,
    type: this.getResourceType(entry.name) }
            sessionId: this.sessionId 
    };
        this.performanceData.networkRequests.push(data);
        this.trimDataArray('networkRequests);'
    }

    /**
     * 測定タイミングの記録
     */
    recordMeasureTiming(entry) {
        const data = {
            timestamp: Date.now(),
            name: entry.name,
            duration: entry.duration,
    startTime: entry.startTime }
            sessionId: this.sessionId 
    };
        this.performanceData.renderTimes.push(data);
        this.trimDataArray('renderTimes);'
    }

    /**
     * リソースロード時間の記録
     */
    recordResourceLoadTime(data) {

        this.performanceData.networkRequests.push(data),
        this.trimDataArray('networkRequests',
','
        // 遅いリソース読み込み警告
        if (data.loadTime > 3000) { // 3秒以上
            this.triggerPerformanceWarning('slow_resource_load', {
                resourceType: data.resourceType),
                src: data.src,
    loadTime: data.loadTime }
                threshold: 3000); 
    }

    /**
     * エラーデータの記録
     */
    recordErrorData(data) {

        this.performanceData.errorEvents.push(data),
        this.trimDataArray('errorEvents'),
','

        // エラー発生の通知
    }

        this.triggerPerformanceWarning('error_occurred', data'; }'
    }

    /**
     * パフォーマンス警告のトリガー'
     */''
    triggerPerformanceWarning(type, details) {

        const warningEvent = new CustomEvent('performance-warning', {
            detail: {)
                type: type),
                timestamp: performance.now(
    details: details,
                sessionId: this.sessionId 
    });
        window.dispatchEvent(warningEvent);
        console.warn(`Performance warning: ${type}`, details});
    }

    /**
     * リソースタイプの判定'
     */''
    getResourceType(url) {

        const extension = url.split('.).pop().toLowerCase('''
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font'
            }

            'otf': 'font' 
    };
        return typeMap[extension] || 'other';
    }

    /**
     * データ配列のトリミング)
     */)
    trimDataArray(arrayName) {
        const array = this.performanceData[arrayName],
        if (array.length > this.options.maxDataPoints) {
    }
            array.splice(0, array.length - this.options.maxDataPoints); }
}

    /**
     * カスタムタイミング測定の開始'
     */''
    startMeasure(name, startMark = null) {', ' }

        if(typeof, performance.mark === 'function' { }'
            const markName = startMark || `${name}-start`;
            performance.mark(markName);
            return markName;
        }
        return null;
    }

    /**
     * カスタムタイミング測定の終了'
     */''
    endMeasure(name, startMark = null) {', ' }

        if(typeof, performance.mark === 'function' && typeof, performance.measure === 'function' { }
            const endMarkName = `${name}-end`;
            const startMarkName = startMark || `${name}-start`;
            ';'

            performance.mark(endMarkName);
            performance.measure(name, startMarkName, endMarkName);
            ';'
            // 測定結果を取得
            const measures = performance.getEntriesByName(name, 'measure);'
            if (measures.length > 0) {
                const measure = measures[measures.length - 1],
                return { name: name,
                    duration: measure.duration };
                    startTime: measure.startTime 
    }
        }
        return null;
    }

    /**
     * 現在のパフォーマンス統計を取得
     */
    getCurrentStats() {
        const stats = {
            sessionId: this.sessionId }
            collectionDuration: performance.now() }
            dataPointCounts: {};
        // 各カテゴリのデータポイント数
        Object.keys(this.performanceData).forEach(key => {  )
            stats.dataPointCounts[key] = this.performanceData[key].length),

        // 最新のFPS
        if (this.performanceData.fps.length > 0) {
            const latestFPS = this.performanceData.fps[this.performanceData.fps.length - 1] }
            stats.currentFPS = latestFPS.fps; }
            stats.averageFrameTime = latestFPS.frameTime; }
        }

        // 最新のメモリ使用量
        if (this.performanceData.memory.length > 0) {
            const latestMemory = this.performanceData.memory[this.performanceData.memory.length - 1],
            stats.currentMemoryUsage = {
                used: latestMemory.used,
    usagePercent: latestMemory.usagePercent }
                total: latestMemory.total 
    }

        // エラー統計
        stats.errorCount = this.performanceData.errorEvents.length;
        
        return stats;
    }

    /**
     * パフォーマンスデータの取得
     */
    getPerformanceData(category = null, startTime = null, endTime = null) {
        if (category && this.performanceData[category]) {
            let data = this.performanceData[category],
            
            // 時間範囲フィルタリング
            if (startTime || endTime) {
                data = data.filter(item => { )
                    const timestamp = item.timestamp),
                    if (startTime && timestamp < startTime) return false }
                    if (endTime && timestamp > endTime) return false; }
                    return true;);
            }
            
            return data;
        }
        
        return this.performanceData;
    }

    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStatistics() {
        const stats = {
            fps: this.calculateFPSStatistics(),
            memory: this.calculateMemoryStatistics(),
            loadTimes: this.calculateLoadTimeStatistics(
    errors: this.calculateErrorStatistics() }
            network: this.calculateNetworkStatistics(); 
    };

        return stats;
    }

    /**
     * FPS統計の計算
     */
    calculateFPSStatistics() {
        const fpsData = this.performanceData.fps,
        if (fpsData.length === 0) return null,

        const values = fpsData.map(item => item.fps),
        return { current: values[values.length - 1],
            average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
            min: Math.min(...values,
    max: Math.max(...values) }
            belowThreshold: values.filter(fps = > fps < 30).length };
            dataPoints: values.length 
    }

    /**
     * メモリ統計の計算
     */
    calculateMemoryStatistics() {
        const memoryData = this.performanceData.memory,
        if (memoryData.length === 0) return null,

        const usageValues = memoryData.map(item => item.usagePercent),
        const current = memoryData[memoryData.length - 1],

        return { current: {
                used: current.used }
                usagePercent: Math.round(current.usagePercent * 100) / 100 };
                total: current.total 
    };
            averageUsage: Math.round(usageValues.reduce((sum, val) => sum + val, 0) / usageValues.length * 100) / 100,
            peakUsage: Math.max(...usageValues);
            lowUsage: Math.min(...usageValues,
    dataPoints: usageValues.length;
        } }

    /**
     * ロード時間統計の計算
     */
    calculateLoadTimeStatistics() {
        const loadData = this.performanceData.loadTimes,
        if (loadData.length === 0) return null,

        const durations = loadData.map(item => item.duration || item.loadComplete || 0),
        return { averageLoadTime: Math.round(durations.reduce((sum, val) => sum + val, 0) / durations.length),
            fastestLoad: Math.min(...durations) }
            slowestLoad: Math.max(...durations) };
            dataPoints: durations.length 
    }

    /**
     * エラー統計の計算
     */
    calculateErrorStatistics() {
        const errorData = this.performanceData.errorEvents }
        const errorTypes = {};
        errorData.forEach(error => {  ) }
            errorTypes[error.type] = (errorTypes[error.type] || 0) + 1; }
        });

        return { totalErrors: errorData.length,
            errorTypes: errorTypes,;
            recentErrors: errorData.slice(-10) // 最新10件 
    }

    /**
     * ネットワーク統計の計算
     */
    calculateNetworkStatistics() {
        const networkData = this.performanceData.networkRequests,
        if (networkData.length === 0) return null,

        const durations = networkData.map(item => item.loadTime || item.duration || 0),
        const sizes = networkData.filter(item => item.size).map(item => item.size),

        return { requestCount: networkData.length,
            averageLoadTime: durations.length > 0 ? Math.round(durations.reduce((sum, val) => sum + val, 0) / durations.length) : 0,
    
            totalDataTransferred: sizes.reduce((sum, val) => sum + val, 0),' };'

            averageResourceSize: sizes.length > 0 ? Math.round(sizes.reduce((sum, val) => sum + val, 0) / sizes.length) : 0 
        }

    /**
     * データのエクスポート'
     */''
    exportData(format = 'json' {'
        const exportData = {
            sessionId: this.sessionId,
            timestamp: Date.now(
    statistics: this.getPerformanceStatistics() }
            rawData: this.performanceData 
    };
        switch(format.toLowerCase()) { ''
            case 'json':','
                return JSON.stringify(exportData, null, 2),
            case 'csv':,
                return this.convertToCSV(exportData),
            default: return exportData  }
    }

    /**
     * CSVフォーマットへの変換'
     */''
    convertToCSV(data) {
        // FPSデータのCSV変換
        let csv = 'Type,Timestamp,Value,Details\n' }
        data.rawData.fps.forEach(item => {) }
            csv += `FPS,${item.timestamp},${item.fps},frameTime:${item.frameTime}\n`);

        data.rawData.memory.forEach(item => {  }
            csv += `Memory,${item.timestamp},${item.usagePercent},used:${item.used};total:${item.total}\n`);
        });

        return csv;
    }

    /**
     * データのクリア
     */
    clearData() {
        Object.keys(this.performanceData).forEach(key => { ')'
    }

            this.performanceData[key] = []');' }

        console.log('Performance, data cleared'); }'
    }

    /**
     * セッションIDの生成
     */
    generateSessionId() {
    
}
        return `perf_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
    }

    /**
     * リソースの解放
     */
    destroy() {
        this.stop(),
        this.clearData() }

        console.log('PerformanceDataCollector, destroyed'); }

    }'}'