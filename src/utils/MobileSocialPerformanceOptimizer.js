/**
 * モバイル向けソーシャル機能パフォーマンス最適化
 * Issue #37 Task 22.4: モバイル向けパフォーマンス最適化
 */

export class MobileSocialPerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.deviceInfo = null;
        this.performanceMetrics = new Map();
        this.optimizationSettings = null;
        
        // パフォーマンス閾値
        this.thresholds = {
            lowEndDevice: {
                memory: 2, // GB
                cpu: 2,    // cores
                fps: 30
            },
            mediumDevice: {
                memory: 4,
                cpu: 4,
                fps: 45
            },
            highEndDevice: {
                memory: 6,
                cpu: 6,
                fps: 60
            }
        };
        
        // 最適化レベル
        this.optimizationLevels = {
            aggressive: {
                imageQuality: 0.6,
                animationReduction: 0.8,
                updateThrottling: 100,
                cacheSize: 10,
                lazyLoadDelay: 500
            },
            moderate: {
                imageQuality: 0.8,
                animationReduction: 0.5,
                updateThrottling: 50,
                cacheSize: 20,
                lazyLoadDelay: 300
            },
            minimal: {
                imageQuality: 0.9,
                animationReduction: 0.2,
                updateThrottling: 16,
                cacheSize: 50,
                lazyLoadDelay: 100
            }
        };
        
        // メモリ管理
        this.memoryManager = {
            cache: new Map(),
            maxCacheSize: 50,
            lastCleanup: Date.now(),
            cleanupInterval: 300000 // 5分
        };
        
        // パフォーマンス監視
        this.monitoring = {
            enabled: false,
            metricsBuffer: [],
            reportInterval: 30000, // 30秒
            lastReport: Date.now()
        };
    }

    /**
     * 初期化
     */
    async initialize() {
        try {
            // デバイス性能を検出
            this.deviceInfo = await this.detectDevicePerformance();
            
            // 最適化設定を決定
            this.optimizationSettings = this.determineOptimizationLevel();
            
            // パフォーマンス監視を開始
            this.startPerformanceMonitoring();
            
            // メモリ管理を開始
            this.startMemoryManagement();
            
            // 画像最適化を設定
            this.setupImageOptimization();
            
            // アニメーション最適化を設定
            this.setupAnimationOptimization();
            
            this.isInitialized = true;
            console.log('MobileSocialPerformanceOptimizer initialized:', {
                deviceInfo: this.deviceInfo,
                optimizationLevel: this.optimizationSettings.level
            });
            
        } catch (error) {
            console.error('Failed to initialize MobileSocialPerformanceOptimizer:', error);
            throw error;
        }
    }

    /**
     * デバイス性能の検出
     */
    async detectDevicePerformance() {
        const info = {
            // ハードウェア情報
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            
            // 接続情報
            connection: this.getConnectionInfo(),
            
            // ブラウザ性能
            browserPerformance: await this.measureBrowserPerformance(),
            
            // レンダリング性能
            renderingPerformance: await this.measureRenderingPerformance(),
            
            // デバイス分類
            deviceClass: 'medium'
        };

        // デバイスクラスの判定
        info.deviceClass = this.classifyDevice(info);
        
        return info;
    }

    /**
     * 接続情報の取得
     */
    getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (!connection) {
            return {
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false
            };
        }
        
        return {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            saveData: connection.saveData || false
        };
    }

    /**
     * ブラウザ性能の測定
     */
    async measureBrowserPerformance() {
        const startTime = performance.now();
        
        // CPU集約的なタスクを実行
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result += Math.random();
        }
        
        const cpuTime = performance.now() - startTime;
        
        // メモリ情報
        const memoryInfo = performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null;
        
        return {
            cpuBenchmark: cpuTime,
            memoryInfo,
            timeOrigin: performance.timeOrigin,
            // 結果を使用してコンパイラ最適化を防ぐ
            _dummyResult: result
        };
    }

    /**
     * レンダリング性能の測定
     */
    async measureRenderingPerformance() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            const startTime = performance.now();
            
            // レンダリングテスト
            for (let i = 0; i < 100; i++) {
                ctx.fillStyle = `hsl(${i * 3.6}, 50%, 50%)`;
                ctx.fillRect(i % 20 * 10, Math.floor(i / 20) * 10, 10, 10);
            }
            
            // 次のフレームで測定完了
            requestAnimationFrame(() => {
                const renderTime = performance.now() - startTime;
                
                resolve({
                    renderBenchmark: renderTime,
                    canvasSupport: true,
                    context2D: true
                });
            });
        });
    }

    /**
     * デバイス分類
     */
    classifyDevice(info) {
        const memoryScore = info.memory >= this.thresholds.highEndDevice.memory ? 3 :
                           info.memory >= this.thresholds.mediumDevice.memory ? 2 : 1;
        
        const cpuScore = info.cores >= this.thresholds.highEndDevice.cpu ? 3 :
                        info.cores >= this.thresholds.mediumDevice.cpu ? 2 : 1;
        
        const performanceScore = info.browserPerformance.cpuBenchmark < 10 ? 3 :
                                info.browserPerformance.cpuBenchmark < 20 ? 2 : 1;
        
        const totalScore = memoryScore + cpuScore + performanceScore;
        
        if (totalScore >= 8) return 'high';
        if (totalScore >= 6) return 'medium';
        return 'low';
    }

    /**
     * 最適化レベルの決定
     */
    determineOptimizationLevel() {
        const deviceClass = this.deviceInfo.deviceClass;
        const connection = this.deviceInfo.connection;
        
        let level = 'moderate';
        
        // デバイス性能ベースの判定
        if (deviceClass === 'low') {
            level = 'aggressive';
        } else if (deviceClass === 'high') {
            level = 'minimal';
        }
        
        // 接続状況による調整
        if (connection.saveData || 
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g') {
            level = 'aggressive';
        }
        
        const settings = {
            level,
            ...this.optimizationLevels[level],
            deviceClass,
            connectionType: connection.effectiveType
        };
        
        return settings;
    }

    /**
     * パフォーマンス監視の開始
     */
    startPerformanceMonitoring() {
        this.monitoring.enabled = true;
        
        // 定期的な メトリクス収集
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 1000);
        
        // 定期的なレポート
        setInterval(() => {
            this.generatePerformanceReport();
        }, this.monitoring.reportInterval);
    }

    /**
     * パフォーマンスメトリクスの収集
     */
    collectPerformanceMetrics() {
        if (!this.monitoring.enabled) return;
        
        const metrics = {
            timestamp: Date.now(),
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            } : null,
            timing: this.getPageTimings(),
            cacheStats: this.getCacheStats(),
            fps: this.getCurrentFPS()
        };
        
        this.monitoring.metricsBuffer.push(metrics);
        
        // バッファサイズ制限
        if (this.monitoring.metricsBuffer.length > 100) {
            this.monitoring.metricsBuffer.shift();
        }
        
        // 閾値チェック
        this.checkPerformanceThresholds(metrics);
    }

    /**
     * 現在のFPS取得
     */
    getCurrentFPS() {
        if (!this.fpsCounter) {
            this.fpsCounter = {
                frames: 0,
                lastTime: performance.now(),
                fps: 60
            };
            
            const countFrame = () => {
                this.fpsCounter.frames++;
                const now = performance.now();
                
                if (now - this.fpsCounter.lastTime >= 1000) {
                    this.fpsCounter.fps = this.fpsCounter.frames;
                    this.fpsCounter.frames = 0;
                    this.fpsCounter.lastTime = now;
                }
                
                requestAnimationFrame(countFrame);
            };
            
            requestAnimationFrame(countFrame);
        }
        
        return this.fpsCounter.fps;
    }

    /**
     * ページタイミング情報の取得
     */
    getPageTimings() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return null;
        
        return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            loadComplete: navigation.loadEventEnd - navigation.navigationStart,
            firstPaint: this.getFirstPaintTime(),
            firstContentfulPaint: this.getFirstContentfulPaintTime()
        };
    }

    /**
     * First Paint時間の取得
     */
    getFirstPaintTime() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : 0;
    }

    /**
     * First Contentful Paint時間の取得
     */
    getFirstContentfulPaintTime() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    /**
     * キャッシュ統計の取得
     */
    getCacheStats() {
        return {
            size: this.memoryManager.cache.size,
            maxSize: this.memoryManager.maxCacheSize,
            hitRate: this.calculateCacheHitRate(),
            lastCleanup: this.memoryManager.lastCleanup
        };
    }

    /**
     * キャッシュヒット率の計算
     */
    calculateCacheHitRate() {
        const total = this.memoryManager.hits + this.memoryManager.misses;
        if (total === 0) return 0;
        return (this.memoryManager.hits / total) * 100;
    }

    /**
     * パフォーマンス閾値チェック
     */
    checkPerformanceThresholds(metrics) {
        const warnings = [];
        
        // FPS チェック
        if (metrics.fps < this.thresholds[this.deviceInfo.deviceClass].fps) {
            warnings.push(`Low FPS detected: ${metrics.fps}`);
            this.adjustForLowFPS();
        }
        
        // メモリ使用量チェック
        if (metrics.memory && metrics.memory.used > metrics.memory.total * 0.8) {
            warnings.push('High memory usage detected');
            this.triggerMemoryCleanup();
        }
        
        // 警告の処理
        if (warnings.length > 0) {
            this.handlePerformanceWarnings(warnings);
        }
    }

    /**
     * 低FPS時の調整
     */
    adjustForLowFPS() {
        // アニメーション品質を下げる
        if (this.optimizationSettings.animationReduction < 0.9) {
            this.optimizationSettings.animationReduction += 0.1;
            this.applyAnimationOptimization();
        }
        
        // 更新頻度を下げる
        if (this.optimizationSettings.updateThrottling < 200) {
            this.optimizationSettings.updateThrottling += 16;
            this.applyUpdateThrottling();
        }
    }

    /**
     * メモリ管理の開始
     */
    startMemoryManagement() {
        // 定期的なクリーンアップ
        setInterval(() => {
            this.performMemoryCleanup();
        }, this.memoryManager.cleanupInterval);
        
        // メモリ圧迫時の自動クリーンアップ
        this.setupMemoryPressureDetection();
    }

    /**
     * メモリクリーンアップの実行
     */
    performMemoryCleanup() {
        const now = Date.now();
        
        // 古いキャッシュエントリの削除
        for (const [key, entry] of this.memoryManager.cache.entries()) {
            if (now - entry.timestamp > 600000) { // 10分以上古い
                this.memoryManager.cache.delete(key);
            }
        }
        
        // キャッシュサイズ制限
        if (this.memoryManager.cache.size > this.memoryManager.maxCacheSize) {
            const entries = Array.from(this.memoryManager.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const removeCount = this.memoryManager.cache.size - this.memoryManager.maxCacheSize;
            for (let i = 0; i < removeCount; i++) {
                this.memoryManager.cache.delete(entries[i][0]);
            }
        }
        
        this.memoryManager.lastCleanup = now;
    }

    /**
     * メモリ圧迫検出の設定
     */
    setupMemoryPressureDetection() {
        if (performance.memory) {
            setInterval(() => {
                const used = performance.memory.usedJSHeapSize;
                const total = performance.memory.totalJSHeapSize;
                
                if (used / total > 0.85) {
                    this.triggerMemoryCleanup();
                }
            }, 5000);
        }
    }

    /**
     * 強制メモリクリーンアップ
     */
    triggerMemoryCleanup() {
        // 即座にクリーンアップを実行
        this.performMemoryCleanup();
        
        // キャッシュサイズを一時的に縮小
        this.memoryManager.maxCacheSize = Math.max(10, this.memoryManager.maxCacheSize * 0.7);
        
        // DOM要素のクリーンアップ
        this.cleanupDOMElements();
        
        console.log('Emergency memory cleanup performed');
    }

    /**
     * DOM要素のクリーンアップ
     */
    cleanupDOMElements() {
        // 非表示の共有ダイアログを削除
        const hiddenDialogs = document.querySelectorAll('.share-dialog:not(.open)');
        hiddenDialogs.forEach(dialog => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        });
        
        // 古いトースト通知を削除
        const oldToasts = document.querySelectorAll('.mobile-toast');
        oldToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    /**
     * 画像最適化の設定
     */
    setupImageOptimization() {
        // 画像品質の動的調整
        this.optimizeImageQuality = (imageData, targetQuality = null) => {
            const quality = targetQuality || this.optimizationSettings.imageQuality;
            
            if (quality >= 0.9) return imageData; // 最適化不要
            
            return this.compressImage(imageData, quality);
        };
        
        // WebP サポートの確認
        this.checkWebPSupport();
    }

    /**
     * 画像圧縮
     */
    compressImage(imageData, quality) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // キャンバスサイズを調整（必要に応じて縮小）
                const scale = quality < 0.7 ? 0.8 : 1.0;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                // 画像を描画
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 圧縮された画像データを取得
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            
            img.src = imageData;
        });
    }

    /**
     * WebP サポートチェック
     */
    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                this.supportsWebP = (webP.height === 2);
                resolve(this.supportsWebP);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * アニメーション最適化の設定
     */
    setupAnimationOptimization() {
        const reduction = this.optimizationSettings.animationReduction;
        
        if (reduction > 0) {
            this.applyAnimationOptimization();
        }
    }

    /**
     * アニメーション最適化の適用
     */
    applyAnimationOptimization() {
        const reduction = this.optimizationSettings.animationReduction;
        
        // CSS アニメーション持続時間の短縮
        const style = document.createElement('style');
        style.id = 'mobile-animation-optimization';
        style.textContent = `
            .mobile-social-optimized * {
                animation-duration: ${1 - reduction}s !important;
                transition-duration: ${1 - reduction}s !important;
            }
            
            ${reduction > 0.5 ? `
                .mobile-social-optimized .ripple-effect::after {
                    display: none;
                }
                
                .mobile-social-optimized .mobile-bottom-sheet {
                    transition: transform 0.1s ease !important;
                }
            ` : ''}
        `;
        
        // 既存のスタイルを置換
        const existing = document.getElementById('mobile-animation-optimization');
        if (existing) {
            existing.parentNode.removeChild(existing);
        }
        
        document.head.appendChild(style);
    }

    /**
     * 更新スロットリングの適用
     */
    applyUpdateThrottling() {
        const throttleTime = this.optimizationSettings.updateThrottling;
        
        // UI更新頻度の制限
        this.throttledUpdate = this.throttle(() => {
            // UI更新ロジック
            this.updateUI();
        }, throttleTime);
    }

    /**
     * スロットリング関数
     */
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    /**
     * パフォーマンスレポートの生成
     */
    generatePerformanceReport() {
        if (this.monitoring.metricsBuffer.length === 0) return;
        
        const report = {
            timestamp: Date.now(),
            deviceInfo: this.deviceInfo,
            optimizationSettings: this.optimizationSettings,
            metrics: this.analyzeMetrics(),
            recommendations: this.generateRecommendations()
        };
        
        console.log('Performance Report:', report);
        
        // 必要に応じて最適化設定を調整
        this.adjustOptimizationSettings(report);
        
        return report;
    }

    /**
     * メトリクス分析
     */
    analyzeMetrics() {
        const buffer = this.monitoring.metricsBuffer;
        const recentMetrics = buffer.slice(-30); // 直近30サンプル
        
        return {
            averageFPS: this.calculateAverage(recentMetrics.map(m => m.fps)),
            memoryTrend: this.calculateMemoryTrend(recentMetrics),
            cacheEfficiency: this.calculateCacheHitRate(),
            performanceScore: this.calculatePerformanceScore(recentMetrics)
        };
    }

    /**
     * 平均値計算
     */
    calculateAverage(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    /**
     * メモリトレンド計算
     */
    calculateMemoryTrend(metrics) {
        const memoryValues = metrics
            .filter(m => m.memory)
            .map(m => m.memory.used);
            
        if (memoryValues.length < 2) return 'stable';
        
        const trend = (memoryValues[memoryValues.length - 1] - memoryValues[0]) / memoryValues[0];
        
        if (trend > 0.1) return 'increasing';
        if (trend < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * パフォーマンススコア計算
     */
    calculatePerformanceScore(metrics) {
        const avgFPS = this.calculateAverage(metrics.map(m => m.fps));
        const targetFPS = this.thresholds[this.deviceInfo.deviceClass].fps;
        
        const fpsScore = Math.min(100, (avgFPS / targetFPS) * 100);
        const memoryScore = this.calculateMemoryScore(metrics);
        
        return {
            overall: (fpsScore + memoryScore) / 2,
            fps: fpsScore,
            memory: memoryScore
        };
    }

    /**
     * メモリスコア計算
     */
    calculateMemoryScore(metrics) {
        const memoryMetrics = metrics.filter(m => m.memory);
        if (memoryMetrics.length === 0) return 100;
        
        const avgUsage = this.calculateAverage(
            memoryMetrics.map(m => m.memory.used / m.memory.total)
        );
        
        return Math.max(0, 100 - (avgUsage * 100));
    }

    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        const analysis = this.analyzeMetrics();
        const recommendations = [];
        
        if (analysis.averageFPS < this.thresholds[this.deviceInfo.deviceClass].fps) {
            recommendations.push({
                type: 'fps',
                severity: 'high',
                message: 'FPSが低下しています。アニメーションの削減を推奨します。',
                action: 'increaseAnimationReduction'
            });
        }
        
        if (analysis.memoryTrend === 'increasing') {
            recommendations.push({
                type: 'memory',
                severity: 'medium',
                message: 'メモリ使用量が増加傾向です。キャッシュクリーンアップを推奨します。',
                action: 'triggerMemoryCleanup'
            });
        }
        
        if (analysis.cacheEfficiency < 80) {
            recommendations.push({
                type: 'cache',
                severity: 'low',
                message: 'キャッシュ効率が低下しています。キャッシュ戦略の見直しを推奨します。',
                action: 'optimizeCacheStrategy'
            });
        }
        
        return recommendations;
    }

    /**
     * 最適化設定の調整
     */
    adjustOptimizationSettings(report) {
        const recommendations = report.recommendations;
        
        recommendations.forEach(rec => {
            switch (rec.action) {
                case 'increaseAnimationReduction':
                    this.optimizationSettings.animationReduction = Math.min(0.9, 
                        this.optimizationSettings.animationReduction + 0.1);
                    this.applyAnimationOptimization();
                    break;
                    
                case 'triggerMemoryCleanup':
                    this.triggerMemoryCleanup();
                    break;
                    
                case 'optimizeCacheStrategy':
                    this.memoryManager.maxCacheSize = Math.max(10,
                        this.memoryManager.maxCacheSize * 0.8);
                    break;
            }
        });
    }

    /**
     * キャッシュアクセス
     */
    getCachedData(key) {
        const entry = this.memoryManager.cache.get(key);
        
        if (entry) {
            this.memoryManager.hits = (this.memoryManager.hits || 0) + 1;
            entry.accessCount++;
            entry.lastAccess = Date.now();
            return entry.data;
        }
        
        this.memoryManager.misses = (this.memoryManager.misses || 0) + 1;
        return null;
    }

    /**
     * キャッシュ保存
     */
    setCachedData(key, data) {
        const entry = {
            data,
            timestamp: Date.now(),
            lastAccess: Date.now(),
            accessCount: 1
        };
        
        this.memoryManager.cache.set(key, entry);
        
        // キャッシュサイズ制限
        if (this.memoryManager.cache.size > this.memoryManager.maxCacheSize) {
            this.performMemoryCleanup();
        }
    }

    /**
     * 最適化情報の取得
     */
    getOptimizationInfo() {
        return {
            deviceInfo: this.deviceInfo,
            optimizationSettings: this.optimizationSettings,
            performanceMetrics: this.analyzeMetrics(),
            cacheStats: this.getCacheStats(),
            isOptimized: this.isInitialized
        };
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        this.monitoring.enabled = false;
        this.memoryManager.cache.clear();
        
        const optimizationStyle = document.getElementById('mobile-animation-optimization');
        if (optimizationStyle) {
            optimizationStyle.remove();
        }
        
        this.isInitialized = false;
    }
}