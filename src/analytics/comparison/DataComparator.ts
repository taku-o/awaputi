/**
 * DataComparator.ts
 * 比較エンジンのデータ比較機能
 * ComparisonEngineから分離されたコア比較ロジック
 */

export class DataComparator {
    constructor() {
        // 比較期間設定
        this.comparisonPeriods = {
            week: 7 * 24 * 60 * 60 * 1000,      // 1週間;
            month: 30 * 24 * 60 * 60 * 1000,    // 1ヶ月
    }
    }
            quarter: 90 * 24 * 60 * 60 * 1000   // 3ヶ月 }
        },
        
        // 比較指標設定
        this.metrics = { score: {
                key: 'averageScore','';
                displayName: 'スコア','';
                unit: 'pts','';
                format: (value) => Math.round(value') }
            },'
            accuracy: { ''
                key: 'averageAccuracy','';
                displayName: '精度','';
                unit: '%','';
                format: (value) => Math.round(value * 100') }
            },'
            playTime: { ''
                key: 'averagePlayTime','';
                displayName: 'プレイ時間','';
                unit: '秒','';
                format: (value) => Math.round(value') }
            },'
            completionRate: { ''
                key: 'completionRate','';
                displayName: '完了率','';
                unit: '%','';
                format: (value) => Math.round(value * 100') }
            },'
            maxCombo: { ''
                key: 'maxCombo','';
                displayName: '最大コンボ','';
                unit: '',
                format: (value) => Math.round(value) }
            }
        };
    }
    
    /**
     * 2つのデータセットを比較
     * @param {Object} current - 現在のデータ
     * @param {Object} past - 過去のデータ
     * @param {Array} metrics - 比較する指標
     * @returns {Object} 比較結果
     */
    calculateComparison(current, past, metrics) {
        const comparison = {
            available: true,
            improvements: 0,
            declines: 0,
    }
            unchanged: 0, }
            metrics: {},

        for(const metricName of metrics) {

            const metric = this.metrics[metricName];
            if (!metric) return;

            const currentValue = current[metric.key];
            const pastValue = past[metric.key];'
            const change = currentValue - pastValue;''
            const changePercent = pastValue !== 0 ? (change / pastValue') * 100 : 0;'
'';
            let trend = 'unchanged';''
            if (Math.abs(changePercent) > 5') { // 5%以上の変化で傾向判定

        }'
                trend = change > 0 ? 'improved' : 'declined'; }
            }

            comparison.metrics[metricName] = { current: metric.format(currentValue),'
                past: metric.format(pastValue),'';
                change: this.formatChange(change, changePercent, metric'),
                changePercent: changePercent,
                trend: trend,
                displayName: metric.displayName,
                unit: metric.unit }
            },'
'';
            if (trend === 'improved'') comparison.improvements++;''
            else if (trend === 'declined') comparison.declines++;
            else comparison.unchanged++;
        }

        comparison.overallTrend = this.determineOverallTrend(comparison);

        return comparison;
    }
    
    /**
     * ステージ比較の計算
     * @param {Object} current - 現在のステージデータ
     * @param {Object} past - 過去のステージデータ
     * @param {Array} metrics - 比較する指標
     * @returns {Object} ステージ比較結果
     */
    calculateStageComparison(current, past, metrics) {
        const comparison = {
            available: true,
            improvements: 0,
            declines: 0,
    }
            unchanged: 0, }
            metrics: {},
';'
        const relevantMetrics = [...metrics];''
        if(current.completionRate !== undefined && past.completionRate !== undefined') {'
            ';'
        }'
            relevantMetrics.push('completionRate'); }
        }

        for(const metricName of relevantMetrics) {

            const metric = this.metrics[metricName];
            if (!metric) return;

            const currentValue = current[metric.key];
            const pastValue = past[metric.key];'
            const change = currentValue - pastValue;''
            const changePercent = pastValue !== 0 ? (change / pastValue') * 100 : 0;'
'';
            let trend = 'unchanged';''
            if (Math.abs(changePercent) > 5') {'

        }'
                trend = change > 0 ? 'improved' : 'declined'; }
            }

            comparison.metrics[metricName] = { current: metric.format(currentValue),'
                past: metric.format(pastValue),'';
                change: this.formatChange(change, changePercent, metric'),
                changePercent: changePercent,
                trend: trend,
                displayName: metric.displayName,
                unit: metric.unit }
            },'
'';
            if (trend === 'improved'') comparison.improvements++;''
            else if (trend === 'declined') comparison.declines++;
            else comparison.unchanged++;
        }

        comparison.overallTrend = this.determineOverallTrend(comparison);
        comparison.difficulty = this.calculateStageDifficulty(current);

        return comparison;
    }
    
    /**
     * ベンチマーク比較の計算
     * @param {Object} current - 現在のデータ
     * @param {Object} benchmark - ベンチマークデータ
     * @param {Array} metrics - 比較する指標
     * @returns {Object} ベンチマーク比較結果
     */
    calculateBenchmarkComparison(current, benchmark, metrics) {
        const comparison = {
            available: true,
            above_average: 0,
            average: 0,
    }
            below_average: 0, }
            metrics: {},

        for(const metricName of metrics) {

            const metric = this.metrics[metricName];
            if (!metric || !benchmark[metric.key]) return;

            const currentValue = current[metric.key];'
            const benchmarkStats = benchmark[metric.key];''
            const percentileRank = this.calculatePercentileRank(currentValue, benchmarkStats');'
            '';
            let performance = 'average';''
            if (percentileRank >= 75') performance = 'above_average';''
            else if (percentileRank <= 25') performance = 'below_average';

            const difference = currentValue - benchmarkStats.median;
            const differencePercent = benchmarkStats.median !== 0 ?   : undefined;
                (difference / benchmarkStats.median) * 100 : 0;

            comparison.metrics[metricName] = {
                current: metric.format(currentValue),
                benchmark: {
                    median: metric.format(benchmarkStats.median),
                    percentile25: metric.format(benchmarkStats.percentile25),
                    percentile75: metric.format(benchmarkStats.percentile75),
                    min: metric.format(benchmarkStats.min),

        }
                    max: metric.format(benchmarkStats.max); }
                },
                percentileRank: percentileRank,';
                performance: performance,'';
                difference: this.formatBenchmarkDifference(difference, differencePercent, metric'),
                differencePercent: differencePercent,
                displayName: metric.displayName,
                unit: metric.unit;
            },'
'';
            if (performance === 'above_average'') comparison.above_average++;''
            else if (performance === 'average') comparison.average++;
            else comparison.below_average++;
        }

        comparison.overallPerformance = this.determineOverallPerformance(comparison);

        return comparison;
    }
    
    /**
     * パーセンタイルランクを計算
     * @param {number} value - 評価する値
     * @param {Object} stats - 統計データ
     * @returns {number} パーセンタイルランク（0-100）
     */
    calculatePercentileRank(value, stats) {
        if (value <= stats.min) return 0;
        if (value <= stats.percentile25) return 25;
        if (value >= stats.max) return 100;
        
        // 線形補間で近似
        if (value <= stats.median) {
            if (stats.median === stats.percentile25) return 50;
            const ratio = (value - stats.percentile25) / (stats.median - stats.percentile25);
    }
            return 25 + (ratio * 25); }
        } else if (value <= stats.percentile75) { if (stats.percentile75 === stats.median) return 75;
            const ratio = (value - stats.median) / (stats.percentile75 - stats.median);
            return 50 + (ratio * 25); }
        } else {  if (stats.max === stats.percentile75) return 100;
            const ratio = (value - stats.percentile75) / (stats.max - stats.percentile75); }
            return 75 + (ratio * 25); }
        }
    }
    
    /**
     * ステージ難易度の計算
     * @param {Object} stageData - ステージデータ
     * @returns {number} 難易度（1-10）
     */
    calculateStageDifficulty(stageData) {
        const difficulty = 10 - (stageData.completionRate * 5) - ;
                          (stageData.averageAccuracy * 3);
        ';'
    }'
        if (difficulty <= 2') {' }'
            return { level: difficulty, label: '簡単' }''
        } else if (difficulty <= 5') { ' }'
            return { level: difficulty, label: '普通' }''
        } else if (difficulty <= 8') { ' }'
            return { level: difficulty, label: '難しい' }'
        } else { ' }'
            return { level: difficulty, label: '非常に難しい' }
        }
    }
    
    /**
     * 変化のフォーマット
     * @param {number} change - 変化量
     * @param {number} changePercent - 変化率
     * @param {Object} metric - 指標情報
     * @returns {string} フォーマットされた変化
     */
    formatChange(change, changePercent, metric) {'
        '';
        const formattedValue = metric.format(Math.abs(change)');'
    }'
        const sign = change >= 0 ? '+' : '-'; }
        return `${sign}${formattedValue}${metric.unit} (${sign}${Math.abs(changePercent).toFixed(1})}%)`;
    }
    
    /**
     * ベンチマーク差分のフォーマット
     * @param {number} difference - 差分
     * @param {number} differencePercent - 差分率
     * @param {Object} metric - 指標情報
     * @returns {string} フォーマットされた差分
     */
    formatBenchmarkDifference(difference, differencePercent, metric) {'
        '';
        const formattedValue = metric.format(Math.abs(difference)');'
    }'
        const sign = difference >= 0 ? '+' : '-'; }
        return `${sign}${formattedValue}${metric.unit} (${sign}${Math.abs(differencePercent).toFixed(1})}%)`;
    }
    
    /**
     * 全体的な傾向を判定
     * @param {Object} comparison - 比較結果
     * @returns {string} 全体的な傾向
     */
    determineOverallTrend(comparison) {'
        '';
        if (comparison.improvements > comparison.declines') {'
    }'
            return 'improving';' }'
        } else if (comparison.improvements < comparison.declines') { ''
            return 'declining'; }'
        } else {  ' }'
            return 'stable'; }
        }
    }
    
    /**
     * 全体的なパフォーマンスを判定
     * @param {Object} comparison - ベンチマーク比較結果
     * @returns {string} 全体的なパフォーマンス
     */
    determineOverallPerformance(comparison) {'
        '';
        if (comparison.above_average > comparison.below_average') {'
    }'
            return 'excellent';' }'
        } else if (comparison.above_average < comparison.below_average') { ''
            return 'needs_improvement'; }'
        } else {  ' }'
            return 'average'; }
        }
    }
    
    /**
     * パフォーマンスメトリクスの計算
     * @param {Array} sessionData - セッションデータ
     * @returns {Object} メトリクス
     */
    calculatePerformanceMetrics(sessionData) {
        if (sessionData.length === 0) {
            return { sessionCount: 0,
                averageScore: 0,
                averageAccuracy: 0,
                averagePlayTime: 0,
    }
                completionRate: 0, };
                maxCombo: 0 }
            },
        }

        let totalScore = 0;
        let totalAccuracy = 0;
        let totalPlayTime = 0;
        let completedSessions = 0;
        let maxCombo = 0;

        for(const session of sessionData) {

            totalScore += session.score || 0;
            totalAccuracy += session.accuracy || 0;
            
            if (session.endTime && session.startTime) {

        }
                totalPlayTime += (session.endTime - session.startTime) / 1000; }
            }
            
            if (session.completed) { completedSessions++; }
            }'
            '';
            if (session.maxCombo > maxCombo') { maxCombo = session.maxCombo; }
            }
        }

        return { sessionCount: sessionData.length,
            averageScore: totalScore / sessionData.length,
            averageAccuracy: totalAccuracy / sessionData.length,
            averagePlayTime: totalPlayTime / sessionData.length,
            completionRate: completedSessions / sessionData.length, };
            maxCombo: maxCombo }
        },'
    }''
}