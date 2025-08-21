/**
 * StatisticsTimeSeriesManager.js
 * 時系列統計データの管理クラス
 * 時系列データの記録、集計、トレンド分析を担当
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

/**
 * 統計時系列管理クラス
 */
export class StatisticsTimeSeriesManager {
    constructor() {
        this.timeSeriesData = [],
        this.maxDataPoints = 1000, // 最大データポイント数
        this.aggregationIntervals = {
            hourly: 60 * 60 * 1000,
            daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000 }
            monthly: 30 * 24 * 60 * 60 * 1000 
    }

    /**
     * 時系列データを記録
     * @param {number} score - スコア
     * @param {number} playTime - プレイ時間
     * @param {boolean} completed - 完了フラグ
     * @param {Object} additionalData - 追加データ
     */
    recordTimeSeriesData(score, playTime, completed, additionalData = { ) {
        try {
            const dataPoint = {
                timestamp: Date.now(),
                score,
                playTime,
                completed,
                efficiency: playTime > 0 ? score / (playTime / 60000) : 0 }
                ...additionalData
            };

            this.timeSeriesData.push(dataPoint);

            // データポイント数の制限
            if (this.timeSeriesData.length > this.maxDataPoints) { this.timeSeriesData.shift(),' }'

            } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'recordTimeSeriesData' }
    }

    /**
     * 時系列データを取得
     * @param {Object} options - 取得オプション
     * @returns {Array} 時系列データ'
     */''
    getTimeSeriesData(options = { )) {
        try {
            const { startDate,
                endDate,
                aggregation = 'none',
                metric = 'score',
                limit } = options;

            let filteredData = [...this.timeSeriesData];

            // 日付フィルタリング
            if (startDate) { filteredData = filteredData.filter(point => point.timestamp >= startDate) }
            }
            if(endDate) { }

                filteredData = filteredData.filter(point => point.timestamp <= endDate); }
            }
';
            // 集計処理
            if(aggregation !== 'none) { filteredData = this.aggregateData(filteredData, aggregation, metric) }'

            // データ制限
            if (limit && filteredData.length > limit) { filteredData = filteredData.slice(-limit) }

            return filteredData;

        } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getTimeSeriesData),
            return [],

    /**
     * データを集計
     * @param {Array} data - 元データ
     * @param {string} interval - 集計間隔
     * @param {string} metric - メトリクス
     * @returns {Array} 集計されたデータ
     */
    aggregateData(data, interval, metric) {
        try {
            const intervalMs = this.aggregationIntervals[interval],
            if (!intervalMs) {
    }
                return data;

            const aggregated = {};

            data.forEach(point => {  ),
                const bucketTime = Math.floor(point.timestamp / intervalMs) * intervalMs,
                
                if(!aggregated[bucketTime]) {
                
                    aggregated[bucketTime] = {
                        timestamp: bucketTime,
    count: 0 }
                        sum: 0 }
                        values: [] 
    }

                aggregated[bucketTime].count++;
                aggregated[bucketTime].sum += point[metric] || 0;
                aggregated[bucketTime].values.push(point[metric] || 0);
            });

            return Object.values(aggregated).map(bucket => ({ timestamp: bucket.timestamp)
                value: bucket.sum / bucket.count,
    count: bucket.count),
                sum: bucket.sum),
                min: Math.min(...bucket.values,
    max: Math.max(...bucket.values)).sort((a, b) => a.timestamp - b.timestamp) } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'aggregateData'),
            return [],

    /**'
     * 集計された時系列データを取得''
     * @param {string} period - 期間 ('daily', 'weekly', 'monthly')
     * @param {number} days - 過去何日分
     * @returns {Object} 集計データ'
     */''
    getAggregatedTimeSeriesData(period = 'daily', days = 30) {
        try {
            const now = Date.now(),
            const startDate = now - (days * 24 * 60 * 60 * 1000'),

            const scoreData = this.getTimeSeriesData({)
                startDate)',
                aggregation: period,')',
                metric: 'score')'),
            const efficiencyData = this.getTimeSeriesData({)
                startDate)',
                aggregation: period,')',
                metric: 'efficiency')'),
            const playTimeData = this.getTimeSeriesData({)
                startDate)',
                aggregation: period,')',
                metric: 'playTime'),
            return { score: scoreData,
                efficiency: efficiencyData,
    playTime: playTimeData,
                period }
                days };
                summary: this.generateSummary(scoreData, efficiencyData, playTimeData); }
            } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getAggregatedTimeSeriesData) }
            return { score: [], efficiency: [], playTime: [], period, days, summary: { }
    }

    /**
     * 時系列統計サマリーを取得
     * @returns {Object} サマリー情報
     */
    getTimeSeriesStatisticsSummary() {
        try {
            if (this.timeSeriesData.length === 0) {
    }
                return { totalDataPoints: 0 };
                    dateRange: null }
                    trends: {};
                    peaks: {};
                    averages: {}

            const dataPoints = this.timeSeriesData.length;
            const firstPoint = this.timeSeriesData[0];
            const lastPoint = this.timeSeriesData[this.timeSeriesData.length - 1];

            return { totalDataPoints: dataPoints,
                dateRange: {
                    start: firstPoint.timestamp,
    end: lastPoint.timestamp };
                    duration: lastPoint.timestamp - firstPoint.timestamp 
    };
                trends: this.calculateTrends();
                peaks: this.findPeaks(
    averages: this.calculateAverages();
            } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getTimeSeriesStatisticsSummary),
            return { totalDataPoints: 0 };
                dateRange: null }
                trends: {};
                peaks: {};
                averages: {
    }

    /**
     * 最近のパフォーマンス情報を取得
     * @param {number} days - 過去何日分
     * @returns {Object} パフォーマンス情報
     */
    getRecentPerformance(days = 7) {
        try {
            const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000),
            const recentData = this.timeSeriesData.filter(point => point.timestamp >= cutoffTime),

            if(recentData.length === 0) {
                return { period: days,
                    gamesPlayed: 0,
    averageScore: 0 }

                    averageEfficiency: 0,' };

                    trend: 'no-data' 
    }

            const totalGames = recentData.length;
            const totalScore = recentData.reduce((sum, point) => sum + point.score, 0);
            const totalEfficiency = recentData.reduce((sum, point) => sum + point.efficiency, 0);

            const averageScore = totalScore / totalGames;
            const averageEfficiency = totalEfficiency / totalGames;

            // トレンド計算（最初の半分vs後半）
            const midPoint = Math.floor(recentData.length / 2);
            const firstHalf = recentData.slice(0, midPoint);
            const secondHalf = recentData.slice(midPoint);

            let trend = 'stable';
            if(firstHalf.length > 0 && secondHalf.length > 0) {
                const firstAvg = firstHalf.reduce((sum, point) => sum + point.score, 0) / firstHalf.length,
                const secondAvg = secondHalf.reduce((sum, point) => sum + point.score, 0) / secondHalf.length,
                ',

                const improvement = (secondAvg - firstAvg) / firstAvg,
                if(improvement > 0.1) trend = 'improving' }

                else if(improvement < -0.1) trend = 'declining'; }
            }

            return { period: days,
                gamesPlayed: totalGames,
                averageScore: Math.round(averageScore,
    averageEfficiency: Math.round(averageEfficiency * 10) / 10,
                trend,
                bestScore: Math.max(...recentData.map(point = > point.score  }
                worstScore: Math.min(...recentData.map(point => point.score); 
    } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getRecentPerformance'),
            return { period: days,
                gamesPlayed: 0,
    averageScore: 0,
                averageEfficiency: 0,' };

                trend: 'no-data' 
    }
    }

    /**
     * ピーク時間帯を取得
     * @returns {Object} ピーク時間帯情報
     */
    getPeakPlayingTimes() {
        try {
            const hourCounts = new Array(24).fill(0),
            const dayCounts = new Array(7).fill(0),

            this.timeSeriesData.forEach(point => { ),
                const date = new Date(point.timestamp) }
                hourCounts[date.getHours()]++; }
                dayCounts[date.getDay()]++; }
            });
';

            const peakHour = hourCounts.indexOf(Math.max(...hourCounts);
            const peakDay = dayCounts.indexOf(Math.max(...dayCounts));

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            return { peakHour: {
                    hour: peakHour };
                    count: hourCounts[peakHour] }
                    timeRange: `${peakHour}:00-${peakHour + 1}:00`
                };
                peakDay: { day: peakDay,
                    name: dayNames[peakDay],
    count: dayCounts[peakDay] };
                hourDistribution: hourCounts,
    dayDistribution: dayCounts;
            } } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getPeakPlayingTimes'),

            return { }'

                peakHour: { hour: 0, count: 0, timeRange: '0:00-1:00'
            },''
                peakDay: { day: 0, name: 'Sunday', count: 0  },
                hourDistribution: new Array(24).fill(0,
    dayDistribution: new Array(7).fill(0);
    }

    /**
     * プレイ時間分布を取得
     * @returns {Object} 時間分布情報
     */
    getPlayTimeDistribution() {
        try {
            const playTimes = this.timeSeriesData.map(point => point.playTime),

            if(playTimes.length === 0) {
    }
                return { }
                    distribution: {};
                    average: 0;
                    median: 0,
    mode: 0;
                } }

            // 時間を分単位のバケットに分類
            const buckets = { ', '0-1min': 0,
                '1-3min': 0,
                '3-5min': 0,
                '5-10min': 0,
                '10-15min': 0,
                '15+min': 0 };

            playTimes.forEach(time => {  ),

                const minutes = time / (60 * 1000),
                if(minutes <= 1) buckets['0-1min]++,
                else if(minutes <= 3) buckets['1-3min]++,
                else if(minutes <= 5) buckets['3-5min]++,
                else if(minutes <= 10) buckets['5-10min]++,
                else if(minutes <= 15) buckets['10-15min]++,' }

                else buckets['15+min]++; }'
            });

            const sortedTimes = [...playTimes].sort((a, b) => a - b);
            const average = playTimes.reduce((sum, time) => sum + time, 0) / playTimes.length;
            const median = sortedTimes[Math.floor(sortedTimes.length / 2)];

            return { distribution: buckets,
                average: Math.round(average),
                median: Math.round(median,
    shortest: sortedTimes[0] };
                longest: sortedTimes[sortedTimes.length - 1] 
    } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'getPlayTimeDistribution'),
            return { }
                distribution: {};
                average: 0;
                median: 0,
    mode: 0;
            } }
    }

    /**'
     * 期間比較分析''
     * @param {string} period1 - 比較期間1('7d', '30d', etc.'
     * @param {string} period2 - 比較期間2
     * @returns {Object} 比較結果'
     */''
    compareTimePeriods(period1 = '7d', period2 = '14d' {'
        try {'
            const now = Date.now()',
            const days1 = parseInt(period1.replace('d', ')',
            const days2 = parseInt(period2.replace('d', '),

            const data1 = this.timeSeriesData.filter(point => ),
                point.timestamp >= now - (days1 * 24 * 60 * 60 * 1000)),

            const data2 = this.timeSeriesData.filter(point => ),
                point.timestamp >= now - (days2 * 24 * 60 * 60 * 1000) &&,
                point.timestamp < now - (days1 * 24 * 60 * 60 * 1000)),

            const stats1 = this.calculatePeriodStats(data1),
            const stats2 = this.calculatePeriodStats(data2) }
            return { }
                period1: { period: period1, ...stats1,
                period2: { period: period2, ...stats2,
                comparison: { scoreChange: this.calculatePercentageChange(stats2.averageScore, stats1.averageScore),
                    efficiencyChange: this.calculatePercentageChange(stats2.averageEfficiency, stats1.averageEfficiency),
                    playTimeChange: this.calculatePercentageChange(stats2.totalPlayTime, stats1.totalPlayTime),
                    gamesChange: this.calculatePercentageChange(stats2.totalGames, stats1.totalGames }
            } catch (error) {
            ErrorHandler.handleError(error, 'StatisticsTimeSeriesManager', 'compareTimePeriods) }
            return { period1: {}, period2: {}, comparison: {
    }

    /**
     * 期間統計を計算
     * @param {Array} data - データ配列
     * @returns {Object} 期間統計
     */
    calculatePeriodStats(data) {
        if (data.length === 0) {
            return { totalGames: 0,
                averageScore: 0,
    averageEfficiency: 0 }
                totalPlayTime: 0 };
                bestScore: 0 
    }

        const totalGames = data.length;
        const totalScore = data.reduce((sum, point) => sum + point.score, 0);
        const totalEfficiency = data.reduce((sum, point) => sum + point.efficiency, 0);
        const totalPlayTime = data.reduce((sum, point) => sum + point.playTime, 0);
        const bestScore = Math.max(...data.map(point => point.score);

        return { totalGames,
            averageScore: totalScore / totalGames,
    averageEfficiency: totalEfficiency / totalGames,
            totalPlayTime };
            bestScore }
        }

    /**
     * パーセンテージ変化を計算
     * @param {number} oldValue - 古い値
     * @param {number} newValue - 新しい値
     * @returns {number} パーセンテージ変化
     */
    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 100 : 0 }
        return ((newValue - oldValue) / oldValue) * 100;

    /**
     * トレンドを計算
     * @returns {Object} トレンド情報
     */
    calculateTrends() {', ' }

        const recent = this.timeSeriesData.slice(-20); }
        const trends = {};

        ['score', 'efficiency', 'playTime].forEach(metric => {  ) }

            trends[metric] = this.calculateTrendFromData(recent, metric);' }'

        }');

        return trends;
    }

    /**
     * データからトレンドを計算
     * @param {Array} data - データ配列'
     * @param {string} metric - メトリクス''
     * @returns {string} トレンド ('up', 'down', 'stable')
     */
    calculateTrendFromData(data, metric) {

        if(data.length < 3) return 'stable',

        const values = data.map(point => point[metric] || 0),
        const firstHalf = values.slice(0, Math.floor(values.length / 2),
        const secondHalf = values.slice(Math.floor(values.length / 2),

        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length,
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length,

        const change = (secondAvg - firstAvg) / firstAvg,

        if(change > 0.1) return 'up',
        if(change < -0.1) return 'down' }

        return 'stable';

    /**
     * ピークを検出
     * @returns {Object} ピーク情報
     */
    findPeaks() {
    
}
        if (this.timeSeriesData.length === 0) return {};

        const scores = this.timeSeriesData.map(point => point.score);
        const efficiencies = this.timeSeriesData.map(point => point.efficiency);

        return { score: {
                max: Math.max(...scores),
                maxIndex: scores.indexOf(Math.max(...scores,
    min: Math.min(...scores) };
                minIndex: scores.indexOf(Math.min(...scores);
            },
            efficiency: { max: Math.max(...efficiencies),
                maxIndex: efficiencies.indexOf(Math.max(...efficiencies),
                min: Math.min(...efficiencies,
    minIndex: efficiencies.indexOf(Math.min(...efficiencies }

    /**
     * 平均値を計算
     * @returns {Object} 平均値情報
     */
    calculateAverages() {
    
}
        if (this.timeSeriesData.length === 0) return {};

        const totals = this.timeSeriesData.reduce((acc, point) => {  acc.score += point.score,
            acc.efficiency += point.efficiency,
            acc.playTime += point.playTime }
            return acc;, { score: 0, efficiency: 0, playTime: 0  });

        const count = this.timeSeriesData.length;

        return { score: totals.score / count,
            efficiency: totals.efficiency / count };
            playTime: totals.playTime / count 
    }

    /**
     * サマリーを生成
     * @param {Array} scoreData - スコアデータ
     * @param {Array} efficiencyData - 効率データ
     * @param {Array} playTimeData - プレイ時間データ
     * @returns {Object} サマリー
     */
    generateSummary(scoreData, efficiencyData, playTimeData) {
        return { totalDataPoints: scoreData.length,
            scoreAverage: scoreData.length > 0 ? scoreData.reduce((sum, point) => sum + point.value, 0) / scoreData.length : 0,
    
            efficiencyAverage: efficiencyData.length > 0 ? efficiencyData.reduce((sum, point) => sum + point.value, 0) / efficiencyData.length : 0 };
            playTimeTotal: playTimeData.length > 0 ? playTimeData.reduce((sum, point) => sum + point.value, 0) : 0 
        }

    /**
     * データをクリア
     */
    clearData() { this.timeSeriesData = [] }

    /**
     * データサイズを取得
     * @returns {number} データポイント数
     */
    getDataSize() { return this.timeSeriesData.length,

// シングルトンインスタンス管理
let statisticsTimeSeriesManagerInstance = null,

/**
 * StatisticsTimeSeriesManagerのシングルトンインスタンスを取得
 * @returns {StatisticsTimeSeriesManager} シングルトンインスタンス
 */
export function getStatisticsTimeSeriesManager() { if (!statisticsTimeSeriesManagerInstance) {
        statisticsTimeSeriesManagerInstance = new StatisticsTimeSeriesManager() }
    return statisticsTimeSeriesManagerInstance;
}

/**
 * StatisticsTimeSeriesManagerのシングルトンインスタンスを再初期化
 * @returns {StatisticsTimeSeriesManager} 新しいシングルトンインスタンス
 */
export function reinitializeStatisticsTimeSeriesManager() {;
    statisticsTimeSeriesManagerInstance = new StatisticsTimeSeriesManager(' }''