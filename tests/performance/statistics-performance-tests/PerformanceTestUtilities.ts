/**
 * PerformanceTestUtilities - Performance testing utility classes
 * Part of the StatisticsPerformance test split implementation
 */

interface MeasurementResult {
    duration: number;
    memoryUsed: number;
    timestamp: number;
}

interface StatsResult {
    count: number;
    duration: {
        min: number;
        max: number;
        average: number;
        median: number;
        p95: number;
        p99: number;
    };
    memory: {
        min: number;
        max: number;
        average: number;
        total: number;
    };
}

// パフォーマンス測定ユーティリティ
export class PerformanceMeasurement {
    private name: string;
    private measurements: MeasurementResult[] = [];
    private memoryBaseline: number | null = null;
    private startTime: number = 0;

    constructor(name: string) {
        this.name = name;
        this.measurements = [];
        this.memoryBaseline = null;
    }

    startMeasurement(): this {
        this.startTime = performance.now();
        this.memoryBaseline = (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
        return this;
    }

    endMeasurement(): MeasurementResult {
        const endTime = performance.now();
        const duration = endTime - this.startTime;
        const memoryUsed = (performance as any).memory ?
            (performance as any).memory.usedJSHeapSize - (this.memoryBaseline || 0) : 0;

        const measurement: MeasurementResult = {
            duration,
            memoryUsed,
            timestamp: Date.now()
        };

        this.measurements.push(measurement);
        return measurement;
    }

    getStats(): StatsResult | null {
        if (this.measurements.length === 0) return null;

        const durations = this.measurements.map(m => m.duration);
        const memoryUsages = this.measurements.map(m => m.memoryUsed);
        
        return {
            count: this.measurements.length,
            duration: {
                min: Math.min(...durations),
                max: Math.max(...durations),
                average: durations.reduce((a, b) => a + b, 0) / durations.length,
                median: this.calculateMedian(durations),
                p95: this.calculatePercentile(durations, 95),
                p99: this.calculatePercentile(durations, 99)
            },
            memory: {
                min: Math.min(...memoryUsages),
                max: Math.max(...memoryUsages),
                average: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
                total: memoryUsages.reduce((a, b) => a + b, 0)
            }
        };
    }

    private calculateMedian(values: number[]): number {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    private calculatePercentile(values: number[], percentile: number): number {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
        return sorted[Math.max(0, index)];
    }

    reset(): void {
        this.measurements = [];
        this.memoryBaseline = null;
        this.startTime = 0;
    }

    getName(): string {
        return this.name;
    }

    getMeasurements(): MeasurementResult[] {
        return [...this.measurements];
    }
}

// テストデータ生成ユーティリティ
export class DataGenerator {
    static generateLargeStatisticsData(size: number = 10000): any {
        const statistics = {
            sessions: [],
            players: [],
            scores: [],
            achievements: [],
            events: []
        };

        for (let i = 0; i < size; i++) {
            statistics.sessions.push({
                id: `session_${i}`,
                playerId: `player_${i % 1000}`,
                startTime: Date.now() - Math.random() * 86400000,
                endTime: Date.now() - Math.random() * 43200000,
                score: Math.floor(Math.random() * 100000),
                level: Math.floor(Math.random() * 20) + 1,
                bublesPopped: Math.floor(Math.random() * 500),
                accuracy: Math.random(),
                completed: Math.random() > 0.3
            });
        }

        for (let i = 0; i < size / 10; i++) {
            statistics.players.push({
                id: `player_${i}`,
                name: `Player_${i}`,
                totalScore: Math.floor(Math.random() * 1000000),
                gamesPlayed: Math.floor(Math.random() * 100),
                averageScore: Math.floor(Math.random() * 50000),
                bestScore: Math.floor(Math.random() * 100000),
                level: Math.floor(Math.random() * 20) + 1
            });
        }

        for (let i = 0; i < size / 5; i++) {
            statistics.scores.push({
                playerId: `player_${i % 1000}`,
                sessionId: `session_${i}`,
                score: Math.floor(Math.random() * 100000),
                timestamp: Date.now() - Math.random() * 86400000,
                difficulty: Math.floor(Math.random() * 5) + 1
            });
        }

        return statistics;
    }

    static generateGameplayEvents(count: number): any[] {
        const events = [];
        const eventTypes = ['bubble_pop', 'miss', 'combo', 'power_up', 'level_complete'];
        
        for (let i = 0; i < count; i++) {
            events.push({
                id: `event_${i}`,
                type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                timestamp: Date.now() - Math.random() * 86400000,
                playerId: `player_${Math.floor(Math.random() * 1000)}`,
                sessionId: `session_${Math.floor(Math.random() * 10000)}`,
                data: {
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    score: Math.floor(Math.random() * 1000),
                    combo: Math.floor(Math.random() * 20)
                }
            });
        }
        
        return events;
    }

    static generateChartData(points: number): any {
        return {
            labels: Array.from({ length: points }, (_, i) => `Point ${i + 1}`),
            datasets: [{
                label: 'Performance Data',
                data: Array.from({ length: points }, () => Math.random() * 100),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }]
        };
    }

    static generateRealtimeData(): any {
        return {
            timestamp: Date.now(),
            activeUsers: Math.floor(Math.random() * 1000),
            averageScore: Math.floor(Math.random() * 50000),
            currentLevel: Math.floor(Math.random() * 20) + 1,
            bubblesPopped: Math.floor(Math.random() * 1000),
            powerUpsUsed: Math.floor(Math.random() * 50)
        };
    }

    static generateStreamData(totalRecords: number, chunkSize: number = 100): AsyncGenerator<any[], void, unknown> {
        return (async function* () {
            for (let i = 0; i < totalRecords; i += chunkSize) {
                const chunk = [];
                const currentChunkSize = Math.min(chunkSize, totalRecords - i);
                
                for (let j = 0; j < currentChunkSize; j++) {
                    chunk.push({
                        id: i + j,
                        data: `Record ${i + j}`,
                        value: Math.random() * 1000,
                        timestamp: Date.now()
                    });
                }
                
                yield chunk;
                // ストリームの遅延をシミュレート
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        })();
    }

    static generateExportFormatData(format: string, recordCount: number): string {
        const records = [];
        
        for (let i = 0; i < recordCount; i++) {
            records.push({
                id: i,
                playerId: `player_${Math.floor(Math.random() * 1000)}`,
                score: Math.floor(Math.random() * 100000),
                timestamp: Date.now() - Math.random() * 86400000
            });
        }

        if (format === 'json') {
            return JSON.stringify(records);
        } else if (format === 'csv') {
            const headers = 'id,playerId,score,timestamp\n';
            const rows = records.map(r => `${r.id},${r.playerId},${r.score},${r.timestamp}`).join('\n');
            return headers + rows;
        } else {
            return records.map(r => `${r.id} ${r.playerId} ${r.score} ${r.timestamp}`).join('\n');
        }
    }

    static generateInvalidEvents(count: number): any[] {
        const invalidEvents = [];
        
        for (let i = 0; i < count; i++) {
            invalidEvents.push({
                // 意図的に無効なデータ
                id: null,
                type: undefined,
                timestamp: 'invalid_date',
                data: {
                    score: 'not_a_number',
                    x: -1000, // 無効な座標
                    y: null
                }
            });
        }
        
        return invalidEvents;
    }

    static generateRawGameplayData(count: number): any[] {
        const rawData = [];
        
        for (let i = 0; i < count; i++) {
            rawData.push({
                // 変換が必要な生データ形式
                event_id: `raw_${i}`,
                event_type: 'bubble_interaction',
                player: `user_${Math.floor(Math.random() * 1000)}`,
                session: `sess_${Math.floor(Math.random() * 10000)}`,
                time: new Date().toISOString(),
                position_x: Math.random() * 800,
                position_y: Math.random() * 600,
                bubble_color: ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)],
                action_result: Math.random() > 0.5 ? 'hit' : 'miss',
                score_delta: Math.floor(Math.random() * 1000),
                combo_level: Math.floor(Math.random() * 10)
            });
        }
        
        return rawData;
    }
}

// パフォーマンステスト結果分析ユーティリティ
export class PerformanceAnalyzer {
    static compareResults(baseline: StatsResult, current: StatsResult): any {
        if (!baseline || !current) return null;

        const durationImprovement = (baseline.duration.average - current.duration.average) / baseline.duration.average;
        const memoryImprovement = (baseline.memory.average - current.memory.average) / baseline.memory.average;

        return {
            duration: {
                improvement: durationImprovement,
                percentageChange: durationImprovement * 100,
                isImprovement: durationImprovement > 0
            },
            memory: {
                improvement: memoryImprovement,
                percentageChange: memoryImprovement * 100,
                isImprovement: memoryImprovement > 0
            },
            overall: {
                score: (durationImprovement + memoryImprovement) / 2,
                recommendation: this.generateRecommendation(durationImprovement, memoryImprovement)
            }
        };
    }

    private static generateRecommendation(durationImprovement: number, memoryImprovement: number): string {
        if (durationImprovement > 0.1 && memoryImprovement > 0.1) {
            return 'Excellent performance improvement in both speed and memory usage';
        } else if (durationImprovement > 0.05) {
            return 'Good performance improvement in execution speed';
        } else if (memoryImprovement > 0.05) {
            return 'Good performance improvement in memory efficiency';
        } else if (durationImprovement < -0.1 || memoryImprovement < -0.1) {
            return 'Performance regression detected - investigation recommended';
        } else {
            return 'Performance is stable with minimal changes';
        }
    }

    static detectPerformanceRegression(historical: StatsResult[], current: StatsResult, threshold: number = 0.1): boolean {
        if (historical.length === 0) return false;

        const recentAverage = historical.slice(-5).reduce((sum, result) => 
            sum + result.duration.average, 0) / Math.min(5, historical.length);
        
        const regression = (current.duration.average - recentAverage) / recentAverage;
        return regression > threshold;
    }

    static generatePerformanceReport(measurements: PerformanceMeasurement[]): any {
        const report = {
            timestamp: new Date().toISOString(),
            totalTests: measurements.length,
            summary: {
                averageDuration: 0,
                totalMemoryUsed: 0,
                fastestTest: null as string | null,
                slowestTest: null as string | null
            },
            details: [] as any[]
        };

        let fastestDuration = Infinity;
        let slowestDuration = 0;

        for (const measurement of measurements) {
            const stats = measurement.getStats();
            if (!stats) continue;

            if (stats.duration.average < fastestDuration) {
                fastestDuration = stats.duration.average;
                report.summary.fastestTest = measurement.getName();
            }

            if (stats.duration.average > slowestDuration) {
                slowestDuration = stats.duration.average;
                report.summary.slowestTest = measurement.getName();
            }

            report.summary.averageDuration += stats.duration.average;
            report.summary.totalMemoryUsed += stats.memory.total;

            report.details.push({
                name: measurement.getName(),
                stats: stats
            });
        }

        report.summary.averageDuration /= measurements.length;

        return report;
    }
}