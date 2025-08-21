/**
 * PerformanceTestUtilities - Performance testing utility classes
 * Part of the StatisticsPerformance test split implementation
 */

// パフォーマンス測定ユーティリティ
export class PerformanceMeasurement {
    constructor(name {
        this.name = name;
        this.measurements = [];
        this.memoryBaseline = null)
;
    startMeasurement() {
        this.startTime = performance.now();
        this.memoryBaseline = performance.memory ? performance.memory.usedJSHeapSize: 0;
        return this }

    endMeasurement() {
        const endTime = performance.now(),
        const duration = endTime - this.startTime,
        const memoryUsed = performance.memory ?   : undefined
            performance.memory.usedJSHeapSize - this.memoryBaseline: 0,

        const measurement = {
            duration,
            memoryUsed,
            timestamp: Date.now( };

        this.measurements.push(measurement);
        return measurement;
    }

    getStats() {
        if (this.measurements.length === 0) return null,

        const durations = this.measurements.map(m => m.duration),
        const memoryUsages = this.measurements.map(m => m.memoryUsed),

        return {
            count: this.measurements.length,
            duration: {
                min: Math.min(...durations,
                max: Math.max(...durations,
                average: durations.reduce((a, b) => a + b, 0) / durations.length;
                median: this.calculateMedian(durations),
               , p95: this.calculatePercentile(durations, 95),
                p99: this.calculatePercentile(durations, 99) };
            memory: {
                min: Math.min(...memoryUsages,
                max: Math.max(...memoryUsages,
                average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
                total: memoryUsages.reduce((a, b) => a + b, 0) }
        };
    }

    calculateMedian(arr {
        const sorted = [...arr].sort((a, b) => a - b),
        const mid = Math.floor(sorted.length / 2),
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];

    calculatePercentile(arr, percentile) {
        const sorted = [...arr].sort((a, b) => a - b),
        const index = Math.ceil((percentile / 100) * sorted.length) - 1,
        return sorted[Math.max(0, index)] }
}

// 大量データ生成ユーティリティ
export class DataGenerator {
    static generateGameplayEvents(count: number): any[] {
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'boss'],
        const events: any[] = [],

        for (let i = 0, i < count, i++') {'
            events.push({
                type: 'bubble_popped'),
               , timestamp: Date.now() + i,
                data: {
                    bubbleType: bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)],
                    score: Math.floor(Math.random() * 1000) + 50,
                    combo: Math.floor(Math.random() * 20) + 1,
                    position: {
                        x: Math.floor(Math.random() * 800,
                        y: Math.floor(Math.random() * 600 };
                    sessionId: `session-${Math.floor(i / 100})}`
                }
            });
        }

        return events;
    }

    static generateTimeSeriesData(days: number): Map<string, any> {
        const data = new Map(),
        const startDate = new Date(),
        startDate.setDate(startDate.getDate() - days),

        for (let i = 0, i < days, i++) {
            const date = new Date(startDate: any),
            date.setDate(date.getDate() + i),
            const dateStr = date.toISOString(').split('T')[0],'

            data.set(dateStr, {),
                games: Math.floor(Math.random() * 10) + 1,
                score: Math.floor(Math.random() * 50000) + 5000,
                playtime: Math.floor(Math.random() * 3600000) + 600000, // 10分-60分
                bubblesPopped: Math.floor(Math.random() * 500) + 50,
                accuracy: Math.random() * 0.3 + 0.7 // 70%-100%
            });
        }

        return data;
    }

    static generateLargeStatisticsData() {
        const bubbleTypeStats = new Map('),'
        const bubbleTypes = ['normal', 'stone', 'iron', 'diamond', 'rainbow', 'pink', 'clock', 'electric', 'boss'],
        
        bubbleTypes.forEach(type => {
            bubbleTypeStats.set(type, {),
                count: Math.floor(Math.random() * 10000,
                score: Math.floor(Math.random() * 500000,
                accuracy: Math.random() * 0.3 + 0.7,
                averageTime: Math.random() * 2000 + 500
            });
        });

        return {
            gamePlayStats: {
                totalGames: 10000,
                totalPlayTime: 36000000, // 10時間
                averageSessionTime: 3600000, // 1時間
                lastPlayTime: Date.now( },
            scoreStats: {
                totalScore: 5000000,
                highestScore: 50000,
                averageScore: 500,
                scoreHistory: Array.from({ length: 1000 ), () => Math.floor(Math.random() * 10000)) },
            bubbleStats: {
                totalPopped: 100000,
                accuracy: 0.85,
                bubbleTypeStats
            },
            comboStats: {
                maxCombo: 100,
                averageCombo: 15,
                comboHistory: Array.from({ length: 500 ), () => Math.floor(Math.random() * 100)) },
            timeSeries: {
                daily: this.generateTimeSeriesData(365,
                weekly: this.generateTimeSeriesData(52,
                monthly: this.generateTimeSeriesData(12 }
        };
    }
}

// テスト用ヘルパー関数
export const PerformanceTestHelper = {
    /**
     * CPU集約的な処理をシミュレーション
     */
    simulateCpuIntensiveTask(durationMs {
        const start = Date.now(),
        while (Date.now() - start < durationMs) {
            Math.random() * Math.random() }
    },

    /**
     * メモリ集約的な処理をシミュレーション
     */
    simulateMemoryIntensiveTask(sizeInMB {
        const arraySize = sizeInMB * 1024 * 1024 / 8, // 8 bytes per number
        const largeArray = new Array(arraySize.fill(0),
        return largeArray.map(() => Math.random() },

    /**
     * ネットワーク遅延をシミュレーション
     */
    async simulateNetworkDelay(delayMs {
        return new Promise(resolve => setTimeout(resolve, delayMs) },

    /**
     * パフォーマンス統計の計算
     */
    calculatePerformanceStats(measurements {
        if (measurements.length === 0) return null,

        const sorted = [...measurements].sort((a, b) => a - b),
        return {
            min: Math.min(...measurements,
            max: Math.max(...measurements,
            mean: measurements.reduce((a, b) => a + b, 0) / measurements.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
            standardDeviation: this.calculateStandardDeviation(measurements
        };),

    /**
     * 標準偏差の計算
     */
    calculateStandardDeviation(values {
        const mean = values.reduce((a, b) => a + b, 0) / values.length,
        const squareDiffs = values.map(value => Math.pow(value - mean, 2),
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length,
        return Math.sqrt(avgSquareDiff') }'
};