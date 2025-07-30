/**
 * Debug Performance Monitor - デバッグツール自体のパフォーマンス監視
 */
export class DebugPerformanceMonitor {
    constructor(debugInterface) {
        this.debugInterface = debugInterface;
        this.metrics = {
            renderTime: [],
            updateTime: [],
            memoryUsage: [],
            operationCounts: {
                panelSwitches: 0,
                modalOpens: 0,
                settingsChanges: 0
            }
        };
        
        this.thresholds = {
            renderTimeWarning: 16.67, // 60fps threshold (ms)
            renderTimeCritical: 33.33, // 30fps threshold (ms)
            memoryWarning: 50, // MB
            memoryCritical: 100 // MB
        };
        
        this.monitoringEnabled = false;
        this.lastMeasurement = 0;
        this.measurementInterval = 100; // 100ms
        this.maxMetricHistory = 100;
        
        this.performanceObserver = null;
        this.startTime = performance.now();
    }

    /**
     * 監視を開始
     */
    startMonitoring() {
        if (this.monitoringEnabled) return;
        
        this.monitoringEnabled = true;
        this.startPerformanceObserver();
        this.startMetricsCollection();
        
        console.log('Debug performance monitoring started');
    }

    /**
     * 監視を停止
     */
    stopMonitoring() {
        if (!this.monitoringEnabled) return;
        
        this.monitoringEnabled = false;
        this.stopPerformanceObserver();
        
        console.log('Debug performance monitoring stopped');
    }

    /**
     * Performance Observer を開始
     */
    startPerformanceObserver() {
        if (!window.PerformanceObserver) return;
        
        try {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.processPerformanceEntry(entry);
                }
            });
            
            // 監視する性能測定タイプ
            this.performanceObserver.observe({ 
                entryTypes: ['measure', 'navigation', 'paint'] 
            });
        } catch (error) {
            console.warn('Performance Observer not supported or failed to start:', error);
        }
    }

    /**
     * Performance Observer を停止
     */
    stopPerformanceObserver() {
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
            this.performanceObserver = null;
        }
    }

    /**
     * パフォーマンスエントリを処理
     */
    processPerformanceEntry(entry) {
        if (entry.name.startsWith('debug-')) {
            this.addMetric('operationTime', entry.duration);
            
            // 閾値チェック
            if (entry.duration > this.thresholds.renderTimeCritical) {
                this.reportPerformanceIssue('critical', `Slow debug operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            } else if (entry.duration > this.thresholds.renderTimeWarning) {
                this.reportPerformanceIssue('warning', `Debug operation slower than expected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
            }
        }
    }

    /**
     * メトリクス収集を開始
     */
    startMetricsCollection() {
        const collectMetrics = () => {
            if (!this.monitoringEnabled) return;
            
            const now = performance.now();
            if (now - this.lastMeasurement < this.measurementInterval) {
                requestAnimationFrame(collectMetrics);
                return;
            }
            
            this.collectCurrentMetrics();
            this.lastMeasurement = now;
            
            requestAnimationFrame(collectMetrics);
        };
        
        requestAnimationFrame(collectMetrics);
    }

    /**
     * 現在のメトリクスを収集
     */
    collectCurrentMetrics() {
        // メモリ使用量を測定
        if (performance.memory) {
            const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.addMetric('memoryUsage', memoryMB);
            
            // メモリ使用量閾値チェック
            if (memoryMB > this.thresholds.memoryCritical) {
                this.reportPerformanceIssue('critical', `High memory usage: ${memoryMB.toFixed(1)}MB`);
            } else if (memoryMB > this.thresholds.memoryWarning) {
                this.reportPerformanceIssue('warning', `Memory usage warning: ${memoryMB.toFixed(1)}MB`);
            }
        }
        
        // DOM要素数を測定（デバッグパネル内のみ）
        if (this.debugInterface.debugPanel) {
            const elementCount = this.debugInterface.debugPanel.querySelectorAll('*').length;
            this.addMetric('domElementCount', elementCount);
        }
    }

    /**
     * メトリクスを追加
     */
    addMetric(type, value) {
        if (!this.metrics[type]) {
            this.metrics[type] = [];
        }
        
        this.metrics[type].push({
            timestamp: performance.now(),
            value: value
        });
        
        // 古いメトリクスを削除
        if (this.metrics[type].length > this.maxMetricHistory) {
            this.metrics[type].shift();
        }
    }

    /**
     * 操作回数を記録
     */
    recordOperation(operationType) {
        if (this.metrics.operationCounts[operationType] !== undefined) {
            this.metrics.operationCounts[operationType]++;
        }
    }

    /**
     * パフォーマンス測定を開始
     */
    startMeasure(name) {
        if (!this.monitoringEnabled) return;
        
        performance.mark(`debug-${name}-start`);
    }

    /**
     * パフォーマンス測定を終了
     */
    endMeasure(name) {
        if (!this.monitoringEnabled) return;
        
        try {
            performance.mark(`debug-${name}-end`);
            performance.measure(`debug-${name}`, `debug-${name}-start`, `debug-${name}-end`);
        } catch (error) {
            console.warn(`Failed to measure ${name}:`, error);
        }
    }

    /**
     * 測定付きで関数を実行
     */
    measureFunction(name, fn) {
        if (!this.monitoringEnabled) {
            return fn();
        }
        
        this.startMeasure(name);
        try {
            const result = fn();
            if (result instanceof Promise) {
                return result.finally(() => this.endMeasure(name));
            } else {
                this.endMeasure(name);
                return result;
            }
        } catch (error) {
            this.endMeasure(name);
            throw error;
        }
    }

    /**
     * パフォーマンス問題を報告
     */
    reportPerformanceIssue(level, message) {
        const issue = {
            level,
            message,
            timestamp: Date.now(),
            uptime: performance.now() - this.startTime
        };
        
        // コンソールに出力
        if (level === 'critical') {
            console.error(`[Debug Performance Critical] ${message}`);
        } else {
            console.warn(`[Debug Performance Warning] ${message}`);
        }
        
        // アクセシビリティマネージャーがあればスクリーンリーダーに通知
        if (this.debugInterface.accessibilityManager && level === 'critical') {
            this.debugInterface.accessibilityManager.announceToScreenReader(
                `Debug performance issue: ${message}`, 'assertive'
            );
        }
    }

    /**
     * パフォーマンス統計を取得
     */
    getPerformanceStats() {
        const stats = {
            uptime: performance.now() - this.startTime,
            monitoringEnabled: this.monitoringEnabled,
            operationCounts: { ...this.metrics.operationCounts },
            currentMetrics: {}
        };
        
        // 各メトリクスタイプの統計を計算
        for (const [type, values] of Object.entries(this.metrics)) {
            if (type === 'operationCounts') continue;
            
            if (values.length > 0) {
                const recentValues = values.slice(-10).map(v => v.value);
                stats.currentMetrics[type] = {
                    current: recentValues[recentValues.length - 1],
                    average: recentValues.reduce((a, b) => a + b, 0) / recentValues.length,
                    min: Math.min(...recentValues),
                    max: Math.max(...recentValues),
                    count: values.length
                };
            }
        }
        
        return stats;
    }

    /**
     * メトリクス履歴を取得
     */
    getMetricsHistory(type, count = 50) {
        const metrics = this.metrics[type];
        if (!metrics) return [];
        
        return metrics.slice(-count);
    }

    /**
     * デバッグインパクトを評価
     */
    evaluateDebugImpact() {
        const stats = this.getPerformanceStats();
        const impact = {
            level: 'minimal', // minimal, low, moderate, high
            score: 0, // 0-100
            issues: [],
            recommendations: []
        };
        
        // メモリ使用量評価
        if (stats.currentMetrics.memoryUsage) {
            const memUsage = stats.currentMetrics.memoryUsage.current;
            if (memUsage > 100) {
                impact.level = 'high';
                impact.score += 40;
                impact.issues.push(`High memory usage: ${memUsage.toFixed(1)}MB`);
                impact.recommendations.push('Consider reducing debug panel complexity');
            } else if (memUsage > 50) {
                impact.level = Math.max(impact.level, 'moderate');
                impact.score += 20;
                impact.issues.push(`Moderate memory usage: ${memUsage.toFixed(1)}MB`);
            }
        }
        
        // DOM要素数評価
        if (stats.currentMetrics.domElementCount) {
            const elemCount = stats.currentMetrics.domElementCount.current;
            if (elemCount > 1000) {
                impact.level = 'high';
                impact.score += 30;
                impact.issues.push(`High DOM element count: ${elemCount}`);
                impact.recommendations.push('Implement virtual scrolling for large lists');
            } else if (elemCount > 500) {
                impact.level = Math.max(impact.level, 'moderate');
                impact.score += 15;
            }
        }
        
        // 操作頻度評価
        const totalOperations = Object.values(stats.operationCounts).reduce((a, b) => a + b, 0);
        if (totalOperations > 1000) {
            impact.score += 10;
            impact.recommendations.push('Consider debouncing frequent operations');
        }
        
        return impact;
    }

    /**
     * パフォーマンス最適化提案を生成
     */
    generateOptimizationSuggestions() {
        const impact = this.evaluateDebugImpact();
        const suggestions = [...impact.recommendations];
        
        // 一般的な最適化提案
        suggestions.push(
            'Use lazy loading for debug panels',
            'Minimize DOM manipulations during updates',
            'Cache frequently accessed elements',
            'Use requestAnimationFrame for smooth animations'
        );
        
        return {
            impact,
            suggestions: suggestions.slice(0, 5) // Top 5 suggestions
        };
    }

    /**
     * パフォーマンスレポートを生成
     */
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();
        const optimization = this.generateOptimizationSuggestions();
        
        return {
            timestamp: new Date().toISOString(),
            uptime: stats.uptime,
            performance: stats,
            impact: optimization.impact,
            suggestions: optimization.suggestions,
            thresholds: this.thresholds
        };
    }

    /**
     * メトリクスをクリア
     */
    clearMetrics() {
        for (const key in this.metrics) {
            if (key === 'operationCounts') {
                for (const opKey in this.metrics.operationCounts) {
                    this.metrics.operationCounts[opKey] = 0;
                }
            } else {
                this.metrics[key] = [];
            }
        }
        
        this.startTime = performance.now();
    }

    /**
     * 閾値を設定
     */
    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    /**
     * 破棄
     */
    destroy() {
        this.stopMonitoring();
        this.clearMetrics();
    }
}