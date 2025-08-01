/**
 * 比較分析エンジン
 * プレイヤーのパフォーマンスを過去データやベンチマークと比較する機能を提供します
 */
export class ComparisonEngine {
    constructor(storageManager) {
        this.storageManager = storageManager;
        
        // 比較期間設定
        this.comparisonPeriods = {
            week: 7 * 24 * 60 * 60 * 1000,      // 1週間
            month: 30 * 24 * 60 * 60 * 1000,    // 1ヶ月
            quarter: 90 * 24 * 60 * 60 * 1000   // 3ヶ月
        };
        
        // 比較指標設定
        this.metrics = {
            score: {
                key: 'averageScore',
                displayName: 'スコア',
                unit: 'pts',
                format: (value) => Math.round(value)
            },
            accuracy: {
                key: 'averageAccuracy',
                displayName: '精度',
                unit: '%',
                format: (value) => Math.round(value * 100)
            },
            playTime: {
                key: 'averagePlayTime',
                displayName: 'プレイ時間',
                unit: '秒',
                format: (value) => Math.round(value)
            },
            completionRate: {
                key: 'completionRate',
                displayName: '完了率',
                unit: '%',
                format: (value) => Math.round(value * 100)
            },
            maxCombo: {
                key: 'maxCombo',
                displayName: '最大コンボ',
                unit: '',
                format: (value) => Math.round(value)
            }
        };
        
        // キャッシュ設定
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5分
    }

    /**
     * 過去データとの比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} 比較結果
     */
    async compareWithPastData(options = {}) {
        try {
            const {
                periods = ['week', 'month'],
                metrics = ['score', 'accuracy', 'playTime'],
                includeDetails = true
            } = options;

            const currentData = await this.getCurrentPerformance();
            if (!currentData || currentData.sessionCount === 0) {
                return {
                    success: false,
                    error: 'Current performance data is insufficient',
                    message: '現在のパフォーマンスデータが不足しています'
                };
            }

            const comparisons = {};
            
            for (const period of periods) {
                const pastData = await this.getPastPerformance(period);
                if (pastData && pastData.sessionCount > 0) {
                    comparisons[period] = this.calculateComparison(
                        currentData, 
                        pastData, 
                        metrics
                    );
                } else {
                    comparisons[period] = {
                        available: false,
                        message: `${period === 'week' ? '1週間' : '1ヶ月'}前のデータが不足しています`
                    };
                }
            }

            const summary = this.generateComparisonSummary(comparisons, metrics);

            return {
                success: true,
                current: currentData,
                comparisons: comparisons,
                summary: summary,
                timestamp: Date.now(),
                details: includeDetails ? this.generateDetailedAnalysis(comparisons) : null
            };

        } catch (error) {
            console.error('Past data comparison failed:', error);
            return {
                success: false,
                error: error.message,
                comparisons: {}
            };
        }
    }

    /**
     * 現在のパフォーマンスデータを取得
     * @returns {Promise<Object>} 現在のパフォーマンス
     */
    async getCurrentPerformance() {
        const cacheKey = 'current_performance';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - this.comparisonPeriods.week);

        const sessionData = await this.storageManager.getData('sessions', {
            range: {
                lower: startDate.getTime(),
                upper: endDate.getTime()
            },
            index: 'startTime'
        });

        if (sessionData.length === 0) {
            return null;
        }

        const performance = this.calculatePerformanceMetrics(sessionData);
        this.setCachedData(cacheKey, performance);
        
        return performance;
    }

    /**
     * 過去のパフォーマンスデータを取得
     * @param {string} period - 比較期間
     * @returns {Promise<Object>} 過去のパフォーマンス
     */
    async getPastPerformance(period) {
        const cacheKey = `past_performance_${period}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const periodMs = this.comparisonPeriods[period];
        const endDate = new Date(Date.now() - periodMs);
        const startDate = new Date(endDate.getTime() - periodMs);

        const sessionData = await this.storageManager.getData('sessions', {
            range: {
                lower: startDate.getTime(),
                upper: endDate.getTime()
            },
            index: 'startTime'
        });

        if (sessionData.length === 0) {
            return null;
        }

        const performance = this.calculatePerformanceMetrics(sessionData);
        this.setCachedData(cacheKey, performance);
        
        return performance;
    }

    /**
     * パフォーマンス指標を計算
     * @param {Array} sessionData - セッションデータ
     * @returns {Object} パフォーマンス指標
     */
    calculatePerformanceMetrics(sessionData) {
        if (sessionData.length === 0) {
            return {
                sessionCount: 0,
                averageScore: 0,
                averageAccuracy: 0,
                averagePlayTime: 0,
                completionRate: 0,
                maxCombo: 0
            };
        }

        const validSessions = sessionData.filter(s => s.finalScore !== undefined);
        const completedSessions = sessionData.filter(s => s.completed === true);

        const totalScore = validSessions.reduce((sum, s) => sum + (s.finalScore || 0), 0);
        const totalPlayTime = sessionData.reduce((sum, s) => {
            if (s.endTime && s.startTime) {
                return sum + (s.endTime - s.startTime) / 1000;
            }
            return sum + (s.duration || 0);
        }, 0);

        const totalBubblesPopped = sessionData.reduce((sum, s) => sum + (s.bubblesPopped || 0), 0);
        const totalBubblesMissed = sessionData.reduce((sum, s) => sum + (s.bubblesMissed || 0), 0);
        const maxCombo = Math.max(...sessionData.map(s => s.maxCombo || 0));

        return {
            sessionCount: sessionData.length,
            averageScore: validSessions.length > 0 ? totalScore / validSessions.length : 0,
            averageAccuracy: (totalBubblesPopped + totalBubblesMissed) > 0 ? 
                totalBubblesPopped / (totalBubblesPopped + totalBubblesMissed) : 0,
            averagePlayTime: sessionData.length > 0 ? totalPlayTime / sessionData.length : 0,
            completionRate: sessionData.length > 0 ? completedSessions.length / sessionData.length : 0,
            maxCombo: maxCombo,
            totalSessions: sessionData.length,
            totalPlayTime: totalPlayTime
        };
    }

    /**
     * 2つのパフォーマンスデータを比較
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
            stable: 0,
            metrics: {}
        };

        metrics.forEach(metricKey => {
            const metric = this.metrics[metricKey];
            if (!metric) return;

            const currentValue = current[metric.key] || 0;
            const pastValue = past[metric.key] || 0;
            
            const change = currentValue - pastValue;
            const changePercent = pastValue !== 0 ? (change / pastValue) * 100 : 0;
            
            let trend = 'stable';
            if (Math.abs(changePercent) > 5) { // 5%以上の変化で傾向判定
                trend = change > 0 ? 'improved' : 'declined';
            }

            comparison.metrics[metricKey] = {
                current: currentValue,
                past: pastValue,
                change: change,
                changePercent: changePercent,
                trend: trend,
                displayCurrent: metric.format(currentValue),
                displayPast: metric.format(pastValue),
                displayChange: this.formatChange(change, changePercent, metric)
            };

            // 傾向カウント
            if (trend === 'improved') comparison.improvements++;
            else if (trend === 'declined') comparison.declines++;
            else comparison.stable++;
        });

        return comparison;
    }

    /**
     * 変化量の表示形式を整形
     * @param {number} change - 変化量
     * @param {number} changePercent - 変化率
     * @param {Object} metric - 指標設定
     * @returns {string} 整形された変化量
     */
    formatChange(change, changePercent, metric) {
        const changeSign = change >= 0 ? '+' : '-';
        const percentSign = changePercent >= 0 ? '+' : '-';
        const formattedChange = metric.format(Math.abs(change));
        const formattedPercent = Math.abs(changePercent).toFixed(1);
        
        return `${changeSign}${formattedChange}${metric.unit} (${percentSign}${formattedPercent}%)`;
    }

    /**
     * 比較サマリーを生成
     * @param {Object} comparisons - 比較結果
     * @param {Array} metrics - 指標リスト
     * @returns {Object} サマリー
     */
    generateComparisonSummary(comparisons, metrics) {
        const availableComparisons = Object.values(comparisons).filter(c => c.available);
        
        if (availableComparisons.length === 0) {
            return {
                overall: 'insufficient_data',
                message: '比較に十分なデータがありません。数日間プレイを続けてから再度確認してください。'
            };
        }

        const totalImprovements = availableComparisons.reduce((sum, c) => sum + c.improvements, 0);
        const totalDeclines = availableComparisons.reduce((sum, c) => sum + c.declines, 0);
        const totalMetrics = availableComparisons.length * metrics.length;

        let overall, message;
        if (totalImprovements > totalDeclines) {
            overall = 'improving';
            message = `全体的にパフォーマンスが向上しています！${totalImprovements}個の指標で改善が見られます。`;
        } else if (totalDeclines > totalImprovements) {
            overall = 'declining';
            message = `一部の指標で低下が見られます。${totalDeclines}個の指標をチェックしてみましょう。`;
        } else {
            overall = 'stable';
            message = 'パフォーマンスは安定しています。継続的な練習で更なる向上を目指しましょう。';
        }

        return {
            overall: overall,
            message: message,
            improvements: totalImprovements,
            declines: totalDeclines,
            stable: totalMetrics - totalImprovements - totalDeclines
        };
    }

    /**
     * 詳細分析を生成
     * @param {Object} comparisons - 比較結果
     * @returns {Object} 詳細分析
     */
    generateDetailedAnalysis(comparisons) {
        const analysis = {
            strengths: [],
            weaknesses: [],
            recommendations: []
        };

        Object.entries(comparisons).forEach(([period, comparison]) => {
            if (!comparison.available) return;

            Object.entries(comparison.metrics).forEach(([metricKey, metric]) => {
                const metricInfo = this.metrics[metricKey];
                
                if (metric.trend === 'improved' && Math.abs(metric.changePercent) > 10) {
                    analysis.strengths.push(
                        `${period === 'week' ? '先週' : '先月'}と比べて${metricInfo.displayName}が${metric.displayChange}向上`
                    );
                } else if (metric.trend === 'declined' && Math.abs(metric.changePercent) > 10) {
                    analysis.weaknesses.push(
                        `${period === 'week' ? '先週' : '先月'}と比べて${metricInfo.displayName}が${metric.displayChange}低下`
                    );
                }
            });
        });

        // 推奨事項を生成
        if (analysis.weaknesses.length > 0) {
            analysis.recommendations.push('低下した指標に焦点を当てて練習することをお勧めします。');
        }
        if (analysis.strengths.length > 0) {
            analysis.recommendations.push('向上した指標の練習方法を継続して、さらなる成長を目指しましょう。');
        }
        if (analysis.strengths.length === 0 && analysis.weaknesses.length === 0) {
            analysis.recommendations.push('安定したパフォーマンスです。新しいステージや難易度に挑戦してみましょう。');
        }

        return analysis;
    }

    /**
     * 期間別トレンド分析
     * @param {Array} periods - 分析期間
     * @param {Array} metrics - 分析指標
     * @returns {Promise<Object>} トレンド分析結果
     */
    async analyzeTrends(periods = ['week', 'month', 'quarter'], metrics = ['score', 'accuracy']) {
        try {
            const trends = {};
            
            for (const period of periods) {
                const data = await this.getTrendData(period);
                if (data && data.length > 0) {
                    trends[period] = this.calculateTrendMetrics(data, metrics);
                }
            }

            return {
                success: true,
                trends: trends,
                summary: this.generateTrendSummary(trends)
            };

        } catch (error) {
            console.error('Trend analysis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * トレンドデータを取得
     * @param {string} period - 期間
     * @returns {Promise<Array>} トレンドデータ
     */
    async getTrendData(period) {
        const periodMs = this.comparisonPeriods[period];
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - periodMs);

        const sessionData = await this.storageManager.getData('sessions', {
            range: {
                lower: startDate.getTime(),
                upper: endDate.getTime()
            },
            index: 'startTime'
        });

        // 日別にグループ化
        const dailyData = new Map();
        sessionData.forEach(session => {
            const date = new Date(session.startTime).toDateString();
            if (!dailyData.has(date)) {
                dailyData.set(date, []);
            }
            dailyData.get(date).push(session);
        });

        // 日別パフォーマンスを計算
        const trendData = [];
        dailyData.forEach((sessions, date) => {
            const performance = this.calculatePerformanceMetrics(sessions);
            performance.date = date;
            trendData.push(performance);
        });

        return trendData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * トレンド指標を計算
     * @param {Array} data - データ
     * @param {Array} metrics - 指標
     * @returns {Object} トレンド指標
     */
    calculateTrendMetrics(data, metrics) {
        const trends = {};
        
        metrics.forEach(metricKey => {
            const metric = this.metrics[metricKey];
            if (!metric) return;

            const values = data.map(d => d[metric.key] || 0);
            const trend = this.calculateLinearTrend(values);
            
            trends[metricKey] = {
                direction: trend.slope > 0.1 ? 'improving' : 
                          trend.slope < -0.1 ? 'declining' : 'stable',
                slope: trend.slope,
                correlation: trend.correlation,
                currentValue: values[values.length - 1] || 0,
                startValue: values[0] || 0,
                improvement: ((values[values.length - 1] || 0) - (values[0] || 0))
            };
        });

        return trends;
    }

    /**
     * 線形トレンドを計算
     * @param {Array} values - 値の配列
     * @returns {Object} トレンド情報
     */
    calculateLinearTrend(values) {
        const n = values.length;
        if (n < 2) return { slope: 0, correlation: 0 };

        const indices = Array.from({ length: n }, (_, i) => i);
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
        const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
        const sumYY = values.reduce((sum, y) => sum + y * y, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const correlation = (n * sumXY - sumX * sumY) / 
            Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

        return { slope, correlation: isNaN(correlation) ? 0 : correlation };
    }

    /**
     * トレンドサマリーを生成
     * @param {Object} trends - トレンド結果
     * @returns {Object} サマリー
     */
    generateTrendSummary(trends) {
        const periods = Object.keys(trends);
        if (periods.length === 0) {
            return {
                message: 'トレンド分析に十分なデータがありません。',
                overall: 'insufficient_data'
            };
        }

        const improvements = [];
        const declines = [];

        periods.forEach(period => {
            Object.entries(trends[period]).forEach(([metric, trend]) => {
                const metricInfo = this.metrics[metric];
                if (trend.direction === 'improving') {
                    improvements.push(`${metricInfo.displayName}(${period})`);
                } else if (trend.direction === 'declining') {
                    declines.push(`${metricInfo.displayName}(${period})`);
                }
            });
        });

        let message;
        if (improvements.length > declines.length) {
            message = `長期的にパフォーマンスが向上傾向にあります。特に${improvements.slice(0, 2).join('、')}で改善が見られます。`;
        } else if (declines.length > improvements.length) {
            message = `一部の指標で低下傾向が見られます。${declines.slice(0, 2).join('、')}に注意が必要です。`;
        } else {
            message = '全体的に安定したパフォーマンスを維持しています。';
        }

        return {
            message: message,
            overall: improvements.length > declines.length ? 'improving' : 
                    declines.length > improvements.length ? 'declining' : 'stable',
            improvements: improvements.length,
            declines: declines.length
        };
    }

    /**
     * キャッシュデータを取得
     * @param {string} key - キー
     * @returns {*} キャッシュされたデータ
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    /**
     * データをキャッシュに保存
     * @param {string} key - キー
     * @param {*} data - データ
     */
    setCachedData(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
    }
}