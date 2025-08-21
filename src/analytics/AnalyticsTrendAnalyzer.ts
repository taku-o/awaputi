/**
 * 分析用トレンド分析システム
 * ゲーム固有の時系列データの分析とトレンド検出を行います
 */
export class AnalyticsTrendAnalyzer {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.analysisCache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5分間のキャッシュ
        
        // 統計計算用の定数
        this.ANOMALY_THRESHOLD = 2.0; // 標準偏差の倍数
        this.MIN_DATA_POINTS = 7; // 最小データポイント数
    }
        this.SEASONAL_PERIOD = 7; // 週次の季節性（7日） }
    }

    /**
     * 週次トレンド分析を実行
     * @param {string} dataType - 分析するデータタイプ
     * @param {Date} startDate - 分析開始日
     * @returns {Promise<Object>} トレンド分析結果
     */
    async analyzeWeeklyTrend(dataType, startDate = null) {
        const cacheKey = `weekly_${dataType}_${startDate? .getTime(}) || 'latest'}`;
        
        // キャッシュチェック
        if(this.analysisCache.has(cacheKey) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiration) {
        }
                return cached.data;

        try { : undefined
            const endDate = startDate ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date();''
            const analysisStartDate = startDate || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000');
';
            // データ取得
            const data = await this.storageManager.getData('sessions', {)
                startDate: analysisStartDate,);
                endDate: endDate),

            if(data.length < this.MIN_DATA_POINTS) {'
                return { success: false,''
                    message: 'データが不足しています。7日以上のデータが必要です。';
            ,}
                    dataPoints: data.length, };
                    requiredPoints: this.MIN_DATA_POINTS }
                }
';
            // 週次トレンド計算
            const trendResult = this.calculateTrend(data, dataType, 'weekly);
            
            // キャッシュに保存
            this.analysisCache.set(cacheKey, { )
                data: trendResult);
                timestamp: Date.now( });

            return trendResult;

        } catch (error) {
            console.error('週次トレンド分析エラー:', error);
            return { success: false,
                error: error.message, };
                dataType: dataType }
            }
    }

    /**
     * 月次トレンド分析を実行
     * @param {string} dataType - 分析するデータタイプ
     * @param {Date} startDate - 分析開始日
     * @returns {Promise<Object>} トレンド分析結果
     */'
    async analyzeMonthlyTrend(dataType, startDate = null) { ' }'

        const cacheKey = `monthly_${dataType}_${startDate? .getTime('}) || 'latest'}`;
        
        // キャッシュチェック
        if(this.analysisCache.has(cacheKey) {
            const cached = this.analysisCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiration) {
        }
                return cached.data;

        try { : undefined
            const endDate = startDate ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) : new Date();''
            const analysisStartDate = startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000');
';
            // データ取得
            const data = await this.storageManager.getData('sessions', {)
                startDate: analysisStartDate,);
                endDate: endDate),

            if(data.length < 30) {'
                return { success: false,''
                    message: 'データが不足しています。30日以上のデータが必要です。';
            ,}
                    dataPoints: data.length, };
                    requiredPoints: 30 }
                }
';
            // 月次トレンド計算
            const trendResult = this.calculateTrend(data, dataType, 'monthly);
            
            // キャッシュに保存
            this.analysisCache.set(cacheKey, { )
                data: trendResult);
                timestamp: Date.now( });

            return trendResult;

        } catch (error) {
            console.error('月次トレンド分析エラー:', error);
            return { success: false,
                error: error.message, };
                dataType: dataType }
            }
    }

    /**
     * トレンド分析の共通計算処理
     * @param {Array} data - 分析データ'
     * @param {string} dataType - データタイプ''
     * @param {string} period - 分析期間（'weekly' | 'monthly'）
     * @returns {Object} 計算結果
     */
    calculateTrend(data, dataType, period) { const metrics = this.extractMetrics(data, dataType);
        const timeSeriesData = this.groupByTimeUnit(metrics, period);
        
        // トレンド分析計算
        const trendAnalysis = {
            success: true;
            period: period;
            dataType: dataType;
            dataPoints: data.length;
            timeRange: {
                start: new Date(Math.min(...data.map(d = > d.startTime) ,}
                end: new Date(Math.max(...data.map(d => d.endTime || d.startTime)); }
            },
            metrics: { scoreImprovement: this.calculateScoreImprovement(timeSeriesData);
                playTimeChange: this.calculatePlayTimeChange(timeSeriesData),
                accuracyChange: this.calculateAccuracyChange(timeSeriesData ,};
            trend: { ''
                direction: null, // 'increasing', 'decreasing', 'stable';
                strength: 0, // 0-1の値;
                confidence: 0 // 0-1の値 ,};
            timeSeriesData: timeSeriesData,
            summary: '';
        },

        // トレンド方向と強度の計算
        const trendInfo = this.calculateTrendDirection(timeSeriesData);
        trendAnalysis.trend = trendInfo;
        
        // サマリー生成
        trendAnalysis.summary = this.generateTrendSummary(trendAnalysis);

        return trendAnalysis;
    }

    /**
     * データからメトリクスを抽出
     * @param {Array} data - セッションデータ
     * @param {string} dataType - データタイプ
     * @returns {Array} メトリクスデータ
     */
    extractMetrics(data, dataType) {
        return data.map(session => { )
            const duration = session.endTime ? ) : undefined
                (session.endTime - session.startTime) / 1000 : session.duration || 0;
            
            const accuracy = session.bubblesPopped && session.bubblesMissed ?   : undefined
                session.bubblesPopped / (session.bubblesPopped + session.bubblesMissed) : 0;

            return { timestamp: session.startTime,
                score: session.finalScore || 0;
                playTime: duration;
                accuracy: accuracy;
    ,}
                combo: session.maxCombo || 0, }
                completed: session.completed || false, };
                date: new Date(session.startTime).toDateString(); }
            };''
        }');
    }

    /**
     * 時間単位でデータをグループ化'
     * @param {Array} metrics - メトリクスデータ''
     * @param {string} period - 期間（'weekly' | 'monthly'）
     * @returns {Array} グループ化されたデータ
     */
    groupByTimeUnit(metrics, period) {
        const grouped = new Map();
        ';

        metrics.forEach(metric => { );''
            const date = new Date(metric.timestamp);
            let key;

            if(period === 'weekly) {'
                // 週の開始日（月曜日）を基準にグループ化
                const weekStart = new Date(date);
    }
                weekStart.setDate(date.getDate() - date.getDay() + 1);' }'

                key = weekStart.toISOString(').split('T)[0]; }

            } else { // 月の開始日を基準にグループ化' }'

                key = `${date.getFullYear(})-${String(date.getMonth(} + 1'}.padStart(2, '0'})`;
            }
            
            if(!grouped.has(key) { grouped.set(key, []); }
            grouped.get(key).push(metric);
        });

        // 集計データ生成
        return Array.from(grouped.entries().map(([key, values]) => {  const totalSessions = values.length;
            const avgScore = values.reduce((sum, v) => sum + v.score, 0) / totalSessions;
            const avgPlayTime = values.reduce((sum, v) => sum + v.playTime, 0) / totalSessions;
            const avgAccuracy = values.reduce((sum, v) => sum + v.accuracy, 0) / totalSessions;
            const completionRate = values.filter(v => v.completed).length / totalSessions;

            return { period: key,
                sessionCount: totalSessions;
                averageScore: avgScore;
                averagePlayTime: avgPlayTime;
                averageAccuracy: avgAccuracy, }
                completionRate: completionRate, };
                maxCombo: Math.max(...values.map(v => v.combo); }
            }).sort((a, b) => a.period.localeCompare(b.period);
    }

    /**
     * スコア改善率を計算
     * @param {Array} timeSeriesData - 時系列データ
     * @returns {number} 改善率（％）
     */
    calculateScoreImprovement(timeSeriesData) {
        if (timeSeriesData.length < 2) return 0;
        
        const firstPeriod = timeSeriesData[0].averageScore;
        const lastPeriod = timeSeriesData[timeSeriesData.length - 1].averageScore;
        
        if (firstPeriod === 0) return 0;
    }
        return ((lastPeriod - firstPeriod) / firstPeriod) * 100;

    /**
     * プレイ時間変化率を計算
     * @param {Array} timeSeriesData - 時系列データ
     * @returns {number} 変化率（％）
     */
    calculatePlayTimeChange(timeSeriesData) {
        if (timeSeriesData.length < 2) return 0;
        
        const firstPeriod = timeSeriesData[0].averagePlayTime;
        const lastPeriod = timeSeriesData[timeSeriesData.length - 1].averagePlayTime;
        
        if (firstPeriod === 0) return 0;
    }
        return ((lastPeriod - firstPeriod) / firstPeriod) * 100;

    /**
     * 精度変化率を計算
     * @param {Array} timeSeriesData - 時系列データ
     * @returns {number} 変化率（％）
     */
    calculateAccuracyChange(timeSeriesData) {
        if (timeSeriesData.length < 2) return 0;
        
        const firstPeriod = timeSeriesData[0].averageAccuracy;
        const lastPeriod = timeSeriesData[timeSeriesData.length - 1].averageAccuracy;
        
        if (firstPeriod === 0) return 0;
    }
        return ((lastPeriod - firstPeriod) / firstPeriod) * 100;

    /**
     * トレンド方向と強度を計算
     * @param {Array} timeSeriesData - 時系列データ
     * @returns {Object} トレンド情報
     */
    calculateTrendDirection(timeSeriesData) {
        ';

    }

        if(timeSeriesData.length < 3) {' }'

            return { direction: 'stable', strength: 0, confidence: 0 ,}

        // 線形回帰でトレンドを計算
        const scores = timeSeriesData.map(d => d.averageScore);
        const indices = timeSeriesData.map((_, i) => i);

        const regression = this.linearRegression(indices, scores);
        const slope = regression.slope;
        const rSquared = regression.rSquared;
';
        // トレンド方向の判定
        let direction = 'stable';''
        if (Math.abs(slope) > 1') { // 閾値は調整可能'
            direction = slope > 0 ? 'increasing' : 'decreasing'; }

        // 強度は傾きの絶対値を正規化
        const maxPossibleSlope = Math.max(...scores) - Math.min(...scores);
        const strength = maxPossibleSlope > 0 ?   : undefined
            Math.min(Math.abs(slope) / maxPossibleSlope, 1) : 0;

        return { direction: direction,
            strength: strength;
            confidence: rSquared, // R²値を信頼度として使用 };
            slope: slope }
        }

    /**
     * 線形回帰計算
     * @param {Array} x - X値配列
     * @param {Array} y - Y値配列
     * @returns {Object} 回帰結果
     */
    linearRegression(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
        const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
        const sumYY = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // R²値の計算
        const yMean = sumY / n;
        const ssRes = y.map((yi, i) => Math.pow(yi - (slope * x[i] + intercept), 2));
                       .reduce((a, b) => a + b, 0);
        const ssTot = y.map(yi => Math.pow(yi - yMean, 2).reduce((a, b) => a + b, 0);
        const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

        return { slope: slope ,}
            intercept: intercept, };
            rSquared: rSquared }
        }

    /**
     * トレンドサマリーを生成
     * @param {Object} trendAnalysis - トレンド分析結果
     * @returns {string} サマリーテキスト
     */''
    generateTrendSummary(trendAnalysis) {
        
    }
        const { metrics, trend, period } = trendAnalysis;

        let summary = `${period === 'weekly' ? '週次' : '月次'}分析結果: `;
        ';
        // トレンド方向
        switch(trend.direction) {'

            case 'increasing':'';
                summary += 'パフォーマンスが向上傾向にあります。';

                break;''
            case 'decreasing':'';
                summary += 'パフォーマンスが低下傾向にあります。';

                break;

        }

            default: summary += 'パフォーマンスは安定しています。'; }
        }
';
        // 具体的な変化
        if (Math.abs(metrics.scoreImprovement) > 5') { ''
            const direction = metrics.scoreImprovement > 0 ? '向上' : '低下'; }
            summary += ` スコアが${Math.abs(metrics.scoreImprovement}.toFixed(1})%${direction}しました。`;
        }

        if (Math.abs(metrics.accuracyChange) > 5') { ''
            const direction = metrics.accuracyChange > 0 ? '向上' : '低下'; }
            summary += ` 精度が${Math.abs(metrics.accuracyChange}.toFixed(1})%${direction}しました。`;
        }

        return summary;
    }

    /**
     * 異常パターンを検出
     * @param {Array} data - 分析データ
     * @param {number} threshold - 閾値（標準偏差の倍数）
     * @returns {Array} 異常データポイント
     */
    detectAnomalies(data, threshold = this.ANOMALY_THRESHOLD) {
        if (data.length < this.MIN_DATA_POINTS) {
    }
            return [];

        const values = data.map(d => d.averageScore || d.score || 0);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        const anomalies = [];
        data.forEach((dataPoint, index) => { const value = dataPoint.averageScore || dataPoint.score || 0;
            const zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;

            if(zScore > threshold) {
                anomalies.push({
                    index: index;
                    value: value);
                    zScore: zScore ,}

                    timestamp: dataPoint.timestamp || dataPoint.period,') }'

                    type: value > mean ? 'outlier_high' : 'outlier_low'); }
});

        return anomalies;
    }

    /**
     * 季節調整を実行
     * @param {Array} data - 時系列データ
     * @param {number} period - 季節性の期間
     * @returns {Array} 季節調整済みデータ
     */
    seasonalAdjustment(data, period = this.SEASONAL_PERIOD) {
        if (data.length < period * 2) {
    }
            return data; // データが不足している場合は調整しない }
        }

        const values = data.map(d => d.averageScore || d.score || 0);
        const seasonalIndices = this.calculateSeasonalIndices(values, period);
        
        return data.map((dataPoint, index) => {  const seasonalIndex = seasonalIndices[index % period];
            const adjustedValue = seasonalIndex > 0 ?   : undefined
                (dataPoint.averageScore || dataPoint.score || 0) / seasonalIndex: (dataPoint.averageScore || dataPoint.score || 0),
            
            return { ...dataPoint,
                originalValue: dataPoint.averageScore || dataPoint.score || 0, 
                seasonallyAdjusted: adjustedValue, };
                seasonalIndex: seasonalIndex }
            });
    }

    /**
     * 季節指数を計算
     * @param {Array} values - 値の配列
     * @param {number} period - 季節性の期間
     * @returns {Array} 季節指数
     */
    calculateSeasonalIndices(values, period) {
        const seasonalSums = new Array(period).fill(0);
        const seasonalCounts = new Array(period).fill(0);
        
        // 各季節位置の平均を計算
        values.forEach((value, index) => { 
            const seasonalPos = index % period;
    }
            seasonalSums[seasonalPos] += value; }
            seasonalCounts[seasonalPos]++; }
        });
        
        const seasonalAverages = seasonalSums.map((sum, i) => ;
            seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : 0;
        );
        
        // 全体平均
        const overallAverage = values.reduce((a, b) => a + b, 0) / values.length;
        
        // 季節指数（全体平均に対する各季節の比率）
        return seasonalAverages.map(avg => );
            overallAverage > 0 ? avg / overallAverage : 1);
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        ';

    }

        this.analysisCache.clear(') }'