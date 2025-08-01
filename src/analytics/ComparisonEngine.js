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
     * ベンチマーク比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} ベンチマーク比較結果
     */
    async compareWithBenchmark(options = {}) {
        try {
            const {
                metrics = ['score', 'accuracy', 'playTime'],
                includeDetails = true,
                benchmarkPeriod = 'quarter' // デフォルトで3ヶ月間のデータを使用
            } = options;

            const currentData = await this.getCurrentPerformance();
            if (!currentData || currentData.sessionCount === 0) {
                return {
                    success: false,
                    error: 'Current performance data is insufficient',
                    message: '現在のパフォーマンスデータが不足しています'
                };
            }

            const benchmarkData = await this.getBenchmarkData(benchmarkPeriod);
            if (!benchmarkData || Object.keys(benchmarkData).length === 0) {
                return {
                    success: false,
                    error: 'Benchmark data is insufficient',
                    message: 'ベンチマークデータが不足しています'
                };
            }

            const comparison = this.calculateBenchmarkComparison(
                currentData, 
                benchmarkData, 
                metrics
            );

            const summary = this.generateBenchmarkSummary(comparison, metrics);

            return {
                success: true,
                current: currentData,
                benchmark: benchmarkData,
                comparison: comparison,
                summary: summary,
                timestamp: Date.now(),
                details: includeDetails ? this.generateBenchmarkAnalysis(comparison) : null
            };

        } catch (error) {
            console.error('Benchmark comparison failed:', error);
            return {
                success: false,
                error: error.message,
                comparison: {}
            };
        }
    }

    /**
     * ベンチマークデータを取得（匿名化された全プレイヤー平均値）
     * @param {string} period - データ収集期間
     * @returns {Promise<Object>} ベンチマークデータ
     */
    async getBenchmarkData(period = 'quarter') {
        const cacheKey = `benchmark_data_${period}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        const periodMs = this.comparisonPeriods[period];
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - periodMs);

        // 全プレイヤーのセッションデータを取得（匿名化）
        const allSessionData = await this.storageManager.getData('sessions', {
            range: {
                lower: startDate.getTime(),
                upper: endDate.getTime()
            },
            index: 'startTime'
        });

        if (allSessionData.length === 0) {
            return null;
        }

        // プレイヤー別にデータをグループ化（匿名化）
        const playerData = new Map();
        allSessionData.forEach(session => {
            // プレイヤーIDは匿名化されたハッシュとして扱う
            const anonymizedPlayerId = this.anonymizePlayerId(session.playerId || 'default');
            if (!playerData.has(anonymizedPlayerId)) {
                playerData.set(anonymizedPlayerId, []);
            }
            playerData.get(anonymizedPlayerId).push(session);
        });

        // 各プレイヤーのパフォーマンス指標を計算
        const playerMetrics = [];
        playerData.forEach((sessions, playerId) => {
            const metrics = this.calculatePerformanceMetrics(sessions);
            if (metrics.sessionCount >= 3) { // 最低3セッション以上のプレイヤーのみ
                playerMetrics.push({
                    playerId: playerId, // 匿名化ID
                    ...metrics
                });
            }
        });

        if (playerMetrics.length === 0) {
            return null;
        }

        // 全プレイヤーの平均値を計算
        const benchmarkData = this.calculateBenchmarkMetrics(playerMetrics);
        this.setCachedData(cacheKey, benchmarkData);
        
        return benchmarkData;
    }

    /**
     * プレイヤーIDを匿名化
     * @param {string} playerId - 元のプレイヤーID
     * @returns {string} 匿名化されたID
     */
    anonymizePlayerId(playerId) {
        // 簡単なハッシュ関数（本番では暗号学的ハッシュを使用）
        let hash = 0;
        for (let i = 0; i < playerId.length; i++) {
            const char = playerId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit整数に変換
        }
        return `player_${Math.abs(hash)}`;
    }

    /**
     * ベンチマーク指標を計算
     * @param {Array} playerMetrics - プレイヤー指標の配列
     * @returns {Object} ベンチマーク指標
     */
    calculateBenchmarkMetrics(playerMetrics) {
        const totalPlayers = playerMetrics.length;
        
        // 各指標の統計値を計算
        const metrics = ['averageScore', 'averageAccuracy', 'averagePlayTime', 'completionRate', 'maxCombo'];
        const benchmark = {
            totalPlayers: totalPlayers,
            dataQuality: this.assessBenchmarkDataQuality(playerMetrics)
        };

        metrics.forEach(metric => {
            const values = playerMetrics.map(p => p[metric] || 0).filter(v => !isNaN(v));
            if (values.length > 0) {
                values.sort((a, b) => a - b);
                
                benchmark[metric] = {
                    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
                    median: values[Math.floor(values.length / 2)],
                    percentile25: values[Math.floor(values.length * 0.25)],
                    percentile75: values[Math.floor(values.length * 0.75)],
                    min: values[0],
                    max: values[values.length - 1],
                    standardDeviation: this.calculateStandardDeviation(values)
                };
            }
        });

        return benchmark;
    }

    /**
     * ベンチマークデータの品質を評価
     * @param {Array} playerMetrics - プレイヤー指標
     * @returns {Object} データ品質評価
     */
    assessBenchmarkDataQuality(playerMetrics) {
        const totalSessions = playerMetrics.reduce((sum, p) => sum + p.sessionCount, 0);
        const avgSessionsPerPlayer = totalSessions / playerMetrics.length;
        
        return {
            playerCount: playerMetrics.length,
            totalSessions: totalSessions,
            averageSessionsPerPlayer: Math.round(avgSessionsPerPlayer * 10) / 10,
            quality: playerMetrics.length >= 10 ? 'high' : 
                    playerMetrics.length >= 3 ? 'medium' : 'low'  // 3人以上でmedium
        };
    }

    /**
     * 標準偏差を計算
     * @param {Array} values - 値の配列
     * @returns {number} 標準偏差
     */
    calculateStandardDeviation(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
        
        return Math.sqrt(variance);
    }

    /**
     * ベンチマーク比較を計算
     * @param {Object} current - 現在のデータ
     * @param {Object} benchmark - ベンチマークデータ
     * @param {Array} metrics - 比較する指標
     * @returns {Object} ベンチマーク比較結果
     */
    calculateBenchmarkComparison(current, benchmark, metrics) {
        const comparison = {
            available: true,
            above_average: 0,
            below_average: 0,
            average: 0,
            metrics: {},
            ranking: {}
        };

        metrics.forEach(metricKey => {
            const metric = this.metrics[metricKey];
            if (!metric || !benchmark[metric.key]) return;

            const currentValue = current[metric.key] || 0;
            const benchmarkStats = benchmark[metric.key];
            
            // パーセンタイル順位を計算
            const percentileRank = this.calculatePercentileRank(
                currentValue, 
                benchmarkStats
            );
            
            let performance = 'average';
            if (percentileRank >= 75) performance = 'above_average';
            else if (percentileRank <= 25) performance = 'below_average';

            const differenceFromMean = currentValue - benchmarkStats.mean;
            const differencePercent = benchmarkStats.mean !== 0 ? 
                (differenceFromMean / benchmarkStats.mean) * 100 : 0;

            comparison.metrics[metricKey] = {
                current: currentValue,
                benchmarkMean: benchmarkStats.mean,
                benchmarkMedian: benchmarkStats.median,
                difference: differenceFromMean,
                differencePercent: differencePercent,
                percentileRank: percentileRank,
                performance: performance,
                displayCurrent: metric.format(currentValue),
                displayBenchmark: metric.format(benchmarkStats.mean),
                displayDifference: this.formatBenchmarkDifference(
                    differenceFromMean, 
                    differencePercent, 
                    metric
                )
            };

            comparison.ranking[metricKey] = {
                percentile: percentileRank,
                above: percentileRank,
                below: 100 - percentileRank
            };

            // パフォーマンスカウント
            if (performance === 'above_average') comparison.above_average++;
            else if (performance === 'below_average') comparison.below_average++;
            else comparison.average++;
        });

        return comparison;
    }

    /**
     * パーセンタイル順位を計算
     * @param {number} value - 値
     * @param {Object} stats - 統計データ
     * @returns {number} パーセンタイル順位（0-100）
     */
    calculatePercentileRank(value, stats) {
        // 境界値の処理
        if (value <= stats.percentile25) return 25;
        if (value >= stats.max) return 100;
        
        // 線形補間でより正確なパーセンタイルを計算
        if (value <= stats.median) {
            if (stats.median === stats.percentile25) return 50; // 分母が0の場合
            const ratio = (value - stats.percentile25) / (stats.median - stats.percentile25);
            return 25 + (ratio * 25);
        } else if (value <= stats.percentile75) {
            if (stats.percentile75 === stats.median) return 75; // 分母が0の場合
            const ratio = (value - stats.median) / (stats.percentile75 - stats.median);
            return 50 + (ratio * 25);
        } else {
            if (stats.max === stats.percentile75) return 100; // 分母が0の場合
            const ratio = (value - stats.percentile75) / (stats.max - stats.percentile75);
            return 75 + (ratio * 25);
        }
    }

    /**
     * ベンチマーク差分の表示形式を整形
     * @param {number} difference - 差分
     * @param {number} differencePercent - 差分パーセント
     * @param {Object} metric - 指標設定
     * @returns {string} 整形された差分
     */
    formatBenchmarkDifference(difference, differencePercent, metric) {
        const diffSign = difference >= 0 ? '+' : '-';
        const percentSign = differencePercent >= 0 ? '+' : '-';
        const formattedDiff = metric.format(Math.abs(difference));
        const formattedPercent = Math.abs(differencePercent).toFixed(1);
        
        return `${diffSign}${formattedDiff}${metric.unit} (${percentSign}${formattedPercent}%)`;
    }

    /**
     * ベンチマークサマリーを生成
     * @param {Object} comparison - 比較結果
     * @param {Array} metrics - 指標リスト
     * @returns {Object} サマリー
     */
    generateBenchmarkSummary(comparison, metrics) {
        const { above_average, below_average, average } = comparison;
        const totalMetrics = metrics.length;
        
        let overall, message;
        
        if (above_average > below_average) {
            overall = 'above_average';
            const percentage = Math.round((above_average / totalMetrics) * 100);
            message = `全体的に平均以上のパフォーマンスです！${above_average}個の指標で平均を上回っています（${percentage}%）。`;
        } else if (below_average > above_average) {
            overall = 'below_average';
            const percentage = Math.round((below_average / totalMetrics) * 100);
            message = `一部の指標で平均を下回っています。${below_average}個の指標で改善の余地があります（${percentage}%）。`;
        } else {
            overall = 'average';
            message = '全体的に平均的なパフォーマンスです。継続的な練習で更なる向上を目指しましょう。';
        }

        return {
            overall: overall,
            message: message,
            above_average: above_average,
            below_average: below_average,
            average: average,
            benchmark_quality: comparison.benchmark?.dataQuality || 'unknown'
        };
    }

    /**
     * ステージ別比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} ステージ別比較結果
     */
    async compareByStage(options = {}) {
        try {
            const {
                metrics = ['score', 'accuracy', 'playTime', 'completionRate'],
                includeDetails = true,
                period = 'month' // デフォルトで1ヶ月間のデータを使用
            } = options;

            // 現在のステージ別パフォーマンスを取得
            const currentStageData = await this.getCurrentStagePerformance(period);
            if (!currentStageData || Object.keys(currentStageData).length === 0) {
                return {
                    success: false,
                    error: 'Current stage performance data is insufficient',
                    message: '現在のステージ別パフォーマンスデータが不足しています'
                };
            }

            // 過去のステージ別パフォーマンスを取得（比較対象期間）
            const pastStageData = await this.getPastStagePerformance(period);

            // ステージ別比較を計算
            const stageComparisons = {};
            const stageList = Object.keys(currentStageData);

            for (const stageId of stageList) {
                const currentStage = currentStageData[stageId];
                const pastStage = pastStageData[stageId] || null;

                stageComparisons[stageId] = {
                    stageInfo: this.getStageInfo(stageId),
                    current: currentStage,
                    past: pastStage,
                    comparison: pastStage ? 
                        this.calculateStageComparison(currentStage, pastStage, metrics) :
                        { available: false, message: 'このステージの過去データが不足しています' },
                    difficulty: this.calculateStageDifficulty(currentStage),
                    performance: this.assessStagePerformance(currentStage, metrics)
                };
            }

            // 全体的なステージ別サマリーを生成
            const summary = this.generateStageComparisonSummary(stageComparisons, metrics);

            return {
                success: true,
                stageComparisons: stageComparisons,
                summary: summary,
                totalStages: stageList.length,
                timestamp: Date.now(),
                details: includeDetails ? this.generateStageAnalysisDetails(stageComparisons) : null
            };

        } catch (error) {
            console.error('Stage comparison failed:', error);
            return {
                success: false,
                error: error.message,
                stageComparisons: {}
            };
        }
    }

    /**
     * 現在のステージ別パフォーマンスを取得
     * @param {string} period - データ取得期間
     * @returns {Promise<Object>} ステージ別パフォーマンス
     */
    async getCurrentStagePerformance(period) {
        const cacheKey = `current_stage_performance_${period}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

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

        if (sessionData.length === 0) {
            return {};
        }

        // ステージ別にデータをグループ化
        const stageGroups = new Map();
        sessionData.forEach(session => {
            const stageId = session.stageId || 'unknown';
            if (!stageGroups.has(stageId)) {
                stageGroups.set(stageId, []);
            }
            stageGroups.get(stageId).push(session);
        });

        // 各ステージのパフォーマンス指標を計算
        const stagePerformance = {};
        stageGroups.forEach((sessions, stageId) => {
            if (sessions.length >= 1) { // 最低1セッション以上
                stagePerformance[stageId] = this.calculateStageMetrics(sessions, stageId);
            }
        });

        this.setCachedData(cacheKey, stagePerformance);
        return stagePerformance;
    }

    /**
     * 過去のステージ別パフォーマンスを取得
     * @param {string} period - 比較期間
     * @returns {Promise<Object>} 過去のステージ別パフォーマンス
     */
    async getPastStagePerformance(period) {
        const cacheKey = `past_stage_performance_${period}`;
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
            return {};
        }

        // ステージ別にデータをグループ化
        const stageGroups = new Map();
        sessionData.forEach(session => {
            const stageId = session.stageId || 'unknown';
            if (!stageGroups.has(stageId)) {
                stageGroups.set(stageId, []);
            }
            stageGroups.get(stageId).push(session);
        });

        // 各ステージのパフォーマンス指標を計算
        const stagePerformance = {};
        stageGroups.forEach((sessions, stageId) => {
            if (sessions.length >= 1) {
                stagePerformance[stageId] = this.calculateStageMetrics(sessions, stageId);
            }
        });

        this.setCachedData(cacheKey, stagePerformance);
        return stagePerformance;
    }

    /**
     * ステージ別指標を計算
     * @param {Array} sessions - セッションデータ
     * @param {string} stageId - ステージID
     * @returns {Object} ステージ指標
     */
    calculateStageMetrics(sessions, stageId) {
        const baseMetrics = this.calculatePerformanceMetrics(sessions);
        
        // ステージ固有の追加指標
        const stageSpecific = {
            stageId: stageId,
            attempts: sessions.length,
            firstCompletionTime: this.findFirstCompletionTime(sessions),
            bestScore: Math.max(...sessions.map(s => s.finalScore || 0)),
            averageAttemptsToComplete: this.calculateAverageAttemptsToComplete(sessions),
            consistencyScore: this.calculateConsistencyScore(sessions),
            difficultyRating: this.estimateStageDifficulty(sessions)
        };

        return { ...baseMetrics, ...stageSpecific };
    }

    /**
     * 最初のクリア時間を取得
     * @param {Array} sessions - セッションデータ
     * @returns {number|null} 最初のクリア時間
     */
    findFirstCompletionTime(sessions) {
        const completedSessions = sessions
            .filter(s => s.completed === true)
            .sort((a, b) => a.startTime - b.startTime);
        
        return completedSessions.length > 0 ? completedSessions[0].startTime : null;
    }

    /**
     * クリアまでの平均試行回数を計算
     * @param {Array} sessions - セッションデータ
     * @returns {number} 平均試行回数
     */
    calculateAverageAttemptsToComplete(sessions) {
        const completedSessions = sessions.filter(s => s.completed === true);
        if (completedSessions.length === 0) return sessions.length;

        // 最初のクリアまでの試行回数を計算
        const firstCompletion = completedSessions[0];
        const attemptsToFirst = sessions
            .filter(s => s.startTime <= firstCompletion.startTime).length;

        return attemptsToFirst;
    }

    /**
     * 一貫性スコアを計算（スコアのばらつきの逆数）
     * @param {Array} sessions - セッションデータ
     * @returns {number} 一貫性スコア（0-1、1が最も一貫している）
     */
    calculateConsistencyScore(sessions) {
        const scores = sessions.map(s => s.finalScore || 0).filter(s => s > 0);
        if (scores.length < 2) return 0;

        const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 変動係数の逆数を一貫性スコアとする（正規化して0-1に）
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
        return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
    }

    /**
     * ステージ難易度を推定
     * @param {Array} sessions - セッションデータ
     * @returns {number} 難易度レーティング（1-10）
     */
    estimateStageDifficulty(sessions) {
        const completionRate = sessions.filter(s => s.completed === true).length / sessions.length;
        const averageScore = sessions.reduce((sum, s) => sum + (s.finalScore || 0), 0) / sessions.length;
        const averagePlayTime = sessions.reduce((sum, s) => {
            const duration = s.endTime && s.startTime ? 
                (s.endTime - s.startTime) / 1000 : (s.duration || 0);
            return sum + duration;
        }, 0) / sessions.length;

        // 難易度要因の重み付け計算
        const completionFactor = (1 - completionRate) * 4; // 完了率が低いほど難しい
        const timeFactor = Math.min(2, averagePlayTime / 60); // 時間が長いほど難しい
        const scoreFactor = Math.max(0, (1000 - averageScore) / 200); // スコアが低いほど難しい

        const difficulty = Math.min(10, Math.max(1, completionFactor + timeFactor + scoreFactor));
        return Math.round(difficulty * 10) / 10; // 小数点1桁
    }

    /**
     * ステージ情報を取得
     * @param {string} stageId - ステージID
     * @returns {Object} ステージ情報
     */
    getStageInfo(stageId) {
        // ステージ名のマッピング（実際のゲーム設定に合わせて調整）
        const stageNames = {
            'tutorial': 'チュートリアル',
            'stage1': 'ステージ1 - 基本',
            'stage2': 'ステージ2 - 発展',
            'stage3': 'ステージ3 - 挑戦',
            'stage4': 'ステージ4 - 上級',
            'stage5': 'ステージ5 - エキスパート',
            'endless': 'エンドレスモード',
            'timeattack': 'タイムアタック',
            'awawa': 'アワアワモード'
        };

        return {
            id: stageId,
            name: stageNames[stageId] || `ステージ ${stageId}`,
            category: this.categorizeStage(stageId)
        };
    }

    /**
     * ステージをカテゴリ分け
     * @param {string} stageId - ステージID
     * @returns {string} カテゴリ
     */
    categorizeStage(stageId) {
        if (stageId === 'tutorial') return 'tutorial';
        if (stageId.startsWith('stage')) return 'normal';
        if (['endless', 'timeattack', 'awawa'].includes(stageId)) return 'special';
        return 'other';
    }

    /**
     * ステージ比較を計算
     * @param {Object} current - 現在のステージデータ
     * @param {Object} past - 過去のステージデータ
     * @param {Array} metrics - 比較指標
     * @returns {Object} ステージ比較結果
     */
    calculateStageComparison(current, past, metrics) {
        const comparison = {
            available: true,
            improvements: 0,
            declines: 0,
            stable: 0,
            metrics: {},
            stageSpecific: {
                attemptsChange: current.attempts - past.attempts,
                consistencyChange: current.consistencyScore - past.consistencyScore,
                bestScoreImprovement: current.bestScore - past.bestScore
            }
        };

        // 基本指標の比較
        metrics.forEach(metricKey => {
            const metric = this.metrics[metricKey];
            if (!metric) return;

            const currentValue = current[metric.key] || 0;
            const pastValue = past[metric.key] || 0;
            
            const change = currentValue - pastValue;
            const changePercent = pastValue !== 0 ? (change / pastValue) * 100 : 0;
            
            let trend = 'stable';
            if (Math.abs(changePercent) > 5) {
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
     * ステージ難易度を計算
     * @param {Object} stageData - ステージデータ
     * @returns {Object} 難易度情報
     */
    calculateStageDifficulty(stageData) {
        const difficulty = stageData.difficultyRating || 5;
        let level, description;

        if (difficulty <= 2) {
            level = 'easy';
            description = '簡単';
        } else if (difficulty <= 4) {
            level = 'normal';
            description = '普通';
        } else if (difficulty <= 6) {
            level = 'medium';
            description = 'やや難しい';
        } else if (difficulty <= 8) {
            level = 'hard';
            description = '難しい';
        } else {
            level = 'very_hard';
            description = 'とても難しい';
        }

        return {
            rating: difficulty,
            level: level,
            description: description,
            completionRate: stageData.completionRate || 0
        };
    }

    /**
     * ステージパフォーマンスを評価
     * @param {Object} stageData - ステージデータ
     * @param {Array} metrics - 評価指標
     * @returns {Object} パフォーマンス評価
     */
    assessStagePerformance(stageData, metrics) {
        const scores = [];
        
        // 各指標を0-100点で評価
        if (stageData.completionRate !== undefined) {
            scores.push(stageData.completionRate * 100);
        }
        if (stageData.averageAccuracy !== undefined) {
            scores.push(stageData.averageAccuracy * 100);
        }
        if (stageData.consistencyScore !== undefined) {
            scores.push(stageData.consistencyScore * 100);
        }

        const averageScore = scores.length > 0 ? 
            scores.reduce((sum, s) => sum + s, 0) / scores.length : 50;

        let grade, description;
        if (averageScore >= 90) {
            grade = 'S';
            description = '優秀';
        } else if (averageScore >= 80) {
            grade = 'A';
            description = '良好';
        } else if (averageScore >= 70) {
            grade = 'B';
            description = '標準';
        } else if (averageScore >= 60) {
            grade = 'C';
            description = '要改善';
        } else {
            grade = 'D';
            description = '練習が必要';
        }

        return {
            score: Math.round(averageScore),
            grade: grade,
            description: description,
            strengths: this.identifyStageStrengths(stageData),
            weaknesses: this.identifyStageWeaknesses(stageData)
        };
    }

    /**
     * ステージの強みを特定
     * @param {Object} stageData - ステージデータ
     * @returns {Array} 強み一覧
     */
    identifyStageStrengths(stageData) {
        const strengths = [];
        
        if (stageData.completionRate >= 0.8) {
            strengths.push('高いクリア率');
        }
        if (stageData.averageAccuracy >= 0.85) {
            strengths.push('高い精度');
        }
        if (stageData.consistencyScore >= 0.7) {
            strengths.push('安定したパフォーマンス');
        }
        if (stageData.averageAttemptsToComplete <= 3) {
            strengths.push('素早いクリア');
        }

        return strengths;
    }

    /**
     * ステージの弱みを特定
     * @param {Object} stageData - ステージデータ
     * @returns {Array} 弱み一覧
     */
    identifyStageWeaknesses(stageData) {
        const weaknesses = [];
        
        if (stageData.completionRate < 0.5) {
            weaknesses.push('低いクリア率');
        }
        if (stageData.averageAccuracy < 0.7) {
            weaknesses.push('精度の低さ');
        }
        if (stageData.consistencyScore < 0.4) {
            weaknesses.push('不安定なパフォーマンス');
        }
        if (stageData.averageAttemptsToComplete > 10) {
            weaknesses.push('クリアまでの試行回数が多い');
        }

        return weaknesses;
    }

    /**
     * ステージ比較サマリーを生成
     * @param {Object} stageComparisons - ステージ比較結果
     * @param {Array} metrics - 指標リスト
     * @returns {Object} サマリー
     */
    generateStageComparisonSummary(stageComparisons, metrics) {
        const stages = Object.values(stageComparisons);
        const availableComparisons = stages.filter(s => s.comparison.available);
        
        if (availableComparisons.length === 0) {
            return {
                overall: 'insufficient_data',
                message: 'ステージ別比較に十分なデータがありません。各ステージを複数回プレイしてから再度確認してください。',
                strongestStages: [],
                weakestStages: [],
                improvingStages: [],
                decliningStages: []
            };
        }

        // 最も成績の良いステージと悪いステージを特定
        const rankedStages = stages
            .filter(s => s.performance.score > 0)
            .sort((a, b) => b.performance.score - a.performance.score);

        const strongestStages = rankedStages.slice(0, 3).map(s => ({
            name: s.stageInfo.name,
            grade: s.performance.grade,
            score: s.performance.score
        }));

        const weakestStages = rankedStages.slice(-3).reverse().map(s => ({
            name: s.stageInfo.name,
            grade: s.performance.grade,
            score: s.performance.score
        }));

        // 改善・悪化しているステージを特定
        const improvingStages = availableComparisons
            .filter(s => s.comparison.improvements > s.comparison.declines)
            .map(s => ({
                name: s.stageInfo.name,
                improvements: s.comparison.improvements
            }));

        const decliningStages = availableComparisons
            .filter(s => s.comparison.declines > s.comparison.improvements)
            .map(s => ({
                name: s.stageInfo.name,
                declines: s.comparison.declines
            }));

        // 全体的な傾向を判定
        let overall, message;
        const totalImprovements = availableComparisons.reduce((sum, s) => sum + s.comparison.improvements, 0);
        const totalDeclines = availableComparisons.reduce((sum, s) => sum + s.comparison.declines, 0);

        if (totalImprovements > totalDeclines) {
            overall = 'improving';
            message = `全体的にステージパフォーマンスが向上しています！${improvingStages.length}個のステージで改善が見られます。`;
        } else if (totalDeclines > totalImprovements) {
            overall = 'declining';
            message = `一部のステージで低下が見られます。${decliningStages.length}個のステージで注意が必要です。`;
        } else {
            overall = 'stable';
            message = 'ステージパフォーマンスは安定しています。継続的な練習で更なる向上を目指しましょう。';
        }

        return {
            overall: overall,
            message: message,
            totalStages: stages.length,
            comparableStages: availableComparisons.length,
            strongestStages: strongestStages,
            weakestStages: weakestStages,
            improvingStages: improvingStages,
            decliningStages: decliningStages,
            totalImprovements: totalImprovements,
            totalDeclines: totalDeclines
        };
    }

    /**
     * ステージ分析詳細を生成
     * @param {Object} stageComparisons - ステージ比較結果
     * @returns {Object} 詳細分析
     */
    generateStageAnalysisDetails(stageComparisons) {
        const analysis = {
            categoryAnalysis: {},
            recommendations: [],
            focusAreas: [],
            achievements: []
        };

        // カテゴリ別分析
        const categories = { tutorial: [], normal: [], special: [], other: [] };
        Object.values(stageComparisons).forEach(stage => {
            const category = stage.stageInfo.category;
            if (categories[category]) {
                categories[category].push(stage);
            }
        });

        Object.entries(categories).forEach(([category, stages]) => {
            if (stages.length > 0) {
                const avgScore = stages.reduce((sum, s) => sum + s.performance.score, 0) / stages.length;
                const categoryName = {
                    tutorial: 'チュートリアル',
                    normal: '通常ステージ',
                    special: '特別モード',
                    other: 'その他'
                }[category];

                analysis.categoryAnalysis[category] = {
                    name: categoryName,
                    averageScore: Math.round(avgScore),
                    stageCount: stages.length,
                    performance: avgScore >= 80 ? 'excellent' : avgScore >= 60 ? 'good' : 'needs_improvement'
                };
            }
        });

        // 推奨事項の生成
        const weakStages = Object.values(stageComparisons)
            .filter(s => s.performance.score < 60)
            .sort((a, b) => a.performance.score - b.performance.score);

        if (weakStages.length > 0) {
            analysis.recommendations.push(
                `最も苦手な${weakStages[0].stageInfo.name}から重点的に練習することをお勧めします。`
            );
            analysis.focusAreas.push(weakStages[0].stageInfo.name);
        }

        const improvingStages = Object.values(stageComparisons)
            .filter(s => s.comparison.available && s.comparison.improvements > s.comparison.declines);

        if (improvingStages.length > 0) {
            analysis.achievements.push(`${improvingStages.length}個のステージで改善が見られます。`);
        }

        const excellentStages = Object.values(stageComparisons)
            .filter(s => s.performance.grade === 'S').length;

        if (excellentStages > 0) {
            analysis.achievements.push(`${excellentStages}個のステージでSランクを達成しています。`);
        }

        return analysis;
    }

    /**
     * ベンチマーク詳細分析を生成
     * @param {Object} comparison - 比較結果
     * @returns {Object} 詳細分析
     */
    generateBenchmarkAnalysis(comparison) {
        const analysis = {
            strengths: [],
            improvements: [],
            recommendations: [],
            rankings: []
        };

        Object.entries(comparison.metrics).forEach(([metricKey, metric]) => {
            const metricInfo = this.metrics[metricKey];
            const percentile = comparison.ranking[metricKey]?.percentile || 0;
            
            if (metric.performance === 'above_average') {
                analysis.strengths.push(
                    `${metricInfo.displayName}: 上位${100 - percentile}%に位置（${metric.displayCurrent}）`
                );
            } else if (metric.performance === 'below_average') {
                analysis.improvements.push(
                    `${metricInfo.displayName}: 下位${percentile}%（平均との差: ${metric.displayDifference}）`
                );
            }

            analysis.rankings.push({
                metric: metricInfo.displayName,
                percentile: Math.round(percentile),
                performance: metric.performance,
                current: metric.displayCurrent,
                benchmark: metric.displayBenchmark
            });
        });

        // 推奨事項を生成
        if (analysis.improvements.length > 0) {
            analysis.recommendations.push('平均を下回る指標に焦点を当てて練習することをお勧めします。');
            
            // 具体的な改善提案
            const worstMetric = analysis.rankings.sort((a, b) => a.percentile - b.percentile)[0];
            if (worstMetric) {
                analysis.recommendations.push(
                    `特に${worstMetric.metric}（現在${worstMetric.percentile}パーセンタイル）の改善が効果的です。`
                );
            }
        }
        
        if (analysis.strengths.length > 0) {
            analysis.recommendations.push('強みのある指標を活かしてさらなる向上を目指しましょう。');
        }
        
        if (analysis.strengths.length === 0 && analysis.improvements.length === 0) {
            analysis.recommendations.push('バランスの取れたパフォーマンスです。全体的なスキル向上を目指しましょう。');
        }

        return analysis;
    }

    /**
     * 改善提案を生成
     * @param {Object} comparisonResult - 比較分析結果
     * @param {Object} options - 提案オプション
     * @returns {Object} 改善提案
     */
    generateImprovementSuggestions(comparisonResult, options = {}) {
        const {
            focusAreas = 3,
            timeHorizon = 7, // 日数
            difficultyPreference = 'balanced', // 'easy', 'balanced', 'challenging'
            includeMotivationalElements = true
        } = options;

        const suggestions = {
            planId: `improvement_plan_${Date.now()}`,
            timestamp: Date.now(),
            targetAreas: [],
            actionPlan: [],
            motivation: {},
            timeline: timeHorizon,
            expectedOutcomes: [],
            followUpActions: []
        };

        // 比較結果から弱点を特定
        const weakAreas = this.identifyWeakAreas(comparisonResult);
        const strongAreas = this.identifyStrongAreas(comparisonResult);

        // 重点改善エリアを選択
        suggestions.targetAreas = weakAreas.slice(0, focusAreas).map(area => ({
            metric: area.metric,
            currentLevel: area.currentValue,
            targetLevel: area.suggestedTarget,
            priority: area.priority,
            improvementPotential: area.improvementPotential
        }));

        // アクションプランを生成
        suggestions.actionPlan = this.createActionPlan(
            suggestions.targetAreas, 
            strongAreas,
            difficultyPreference,
            timeHorizon
        );

        // 期待される成果を計算
        suggestions.expectedOutcomes = this.calculateExpectedOutcomes(
            suggestions.targetAreas,
            timeHorizon
        );

        // フォローアップアクションを設定
        suggestions.followUpActions = this.generateFollowUpActions(
            suggestions.targetAreas,
            timeHorizon
        );

        // モチベーション要素を追加
        if (includeMotivationalElements) {
            suggestions.motivation = this.generateMotivationalElements(
                strongAreas,
                suggestions.targetAreas,
                comparisonResult
            );
        }

        return suggestions;
    }

    /**
     * 弱点エリアを特定
     * @param {Object} comparisonResult - 比較結果
     * @returns {Array} 弱点エリア
     */
    identifyWeakAreas(comparisonResult) {
        const weakAreas = [];

        // 過去データとの比較から弱点を特定
        if (comparisonResult.pastComparison && comparisonResult.pastComparison.available) {
            Object.entries(comparisonResult.pastComparison.metrics).forEach(([metricKey, metric]) => {
                if (metric.trend === 'declined' && Math.abs(metric.changePercent) > 10) {
                    weakAreas.push({
                        metric: metricKey,
                        type: 'declining',
                        currentValue: metric.current,
                        pastValue: metric.past,
                        changePercent: metric.changePercent,
                        priority: Math.abs(metric.changePercent) > 20 ? 'high' : 'medium',
                        improvementPotential: Math.abs(metric.changePercent),
                        suggestedTarget: metric.past * 1.1, // 過去の値より10%向上
                        issue: '最近のパフォーマンスが低下しています',
                        category: 'trend'
                    });
                }
            });
        }

        // ベンチマーク比較から弱点を特定
        if (comparisonResult.benchmarkComparison && comparisonResult.benchmarkComparison.available) {
            Object.entries(comparisonResult.benchmarkComparison.metrics).forEach(([metricKey, metric]) => {
                if (metric.performance === 'below_average' && metric.percentileRank < 25) {
                    weakAreas.push({
                        metric: metricKey,
                        type: 'below_benchmark',
                        currentValue: metric.current,
                        benchmarkValue: metric.benchmarkMean,
                        percentileRank: metric.percentileRank,
                        priority: metric.percentileRank < 10 ? 'high' : 'medium',
                        improvementPotential: Math.abs(metric.differencePercent),
                        suggestedTarget: metric.benchmarkMean * 1.05, // ベンチマークより5%向上
                        issue: 'この指標で平均を大きく下回っています',
                        category: 'benchmark'
                    });
                }
            });
        }

        // ステージ別比較から弱点を特定
        if (comparisonResult.stageComparison && comparisonResult.stageComparison.stageComparisons) {
            Object.entries(comparisonResult.stageComparison.stageComparisons).forEach(([stageId, stageData]) => {
                if (stageData.performance && stageData.performance.grade === 'D') {
                    const worstMetric = this.findWorstStageMetric(stageData);
                    if (worstMetric) {
                        weakAreas.push({
                            metric: worstMetric.metric,
                            type: 'stage_specific',
                            stageId: stageId,
                            stageName: stageData.stageInfo.name,
                            currentValue: worstMetric.value,
                            priority: 'medium',
                            improvementPotential: 30, // ステージ固有の改善可能性
                            suggestedTarget: worstMetric.value * 1.3,
                            issue: `${stageData.stageInfo.name}で苦戦しています`,
                            category: 'stage'
                        });
                    }
                }
            });
        }

        // 優先度とインパクトでソート
        return weakAreas.sort((a, b) => {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.improvementPotential - a.improvementPotential;
        });
    }

    /**
     * 強みエリアを特定
     * @param {Object} comparisonResult - 比較結果
     * @returns {Array} 強みエリア
     */
    identifyStrongAreas(comparisonResult) {
        const strongAreas = [];

        // 過去データとの比較から強みを特定
        if (comparisonResult.pastComparison && comparisonResult.pastComparison.available) {
            Object.entries(comparisonResult.pastComparison.metrics).forEach(([metricKey, metric]) => {
                if (metric.trend === 'improved' && Math.abs(metric.changePercent) > 10) {
                    strongAreas.push({
                        metric: metricKey,
                        type: 'improving',
                        currentValue: metric.current,
                        changePercent: metric.changePercent,
                        category: 'trend'
                    });
                }
            });
        }

        // ベンチマーク比較から強みを特定
        if (comparisonResult.benchmarkComparison && comparisonResult.benchmarkComparison.available) {
            Object.entries(comparisonResult.benchmarkComparison.metrics).forEach(([metricKey, metric]) => {
                if (metric.performance === 'above_average' && metric.percentileRank > 75) {
                    strongAreas.push({
                        metric: metricKey,
                        type: 'above_benchmark',
                        currentValue: metric.current,
                        percentileRank: metric.percentileRank,
                        category: 'benchmark'
                    });
                }
            });
        }

        return strongAreas;
    }

    /**
     * ステージの最も弱い指標を特定
     * @param {Object} stageData - ステージデータ
     * @returns {Object|null} 最も弱い指標
     */
    findWorstStageMetric(stageData) {
        if (!stageData.current) return null;

        const metrics = [
            { metric: 'completionRate', value: stageData.current.completionRate || 0 },
            { metric: 'averageAccuracy', value: stageData.current.averageAccuracy || 0 },
            { metric: 'consistencyScore', value: stageData.current.consistencyScore || 0 }
        ];

        return metrics.sort((a, b) => a.value - b.value)[0];
    }

    /**
     * アクションプランを作成
     * @param {Array} targetAreas - 対象エリア
     * @param {Array} strongAreas - 強みエリア
     * @param {string} difficultyPreference - 難易度設定
     * @param {number} timeHorizon - 期間
     * @returns {Array} アクションプラン
     */
    createActionPlan(targetAreas, strongAreas, difficultyPreference, timeHorizon) {
        const actionPlan = [];

        targetAreas.forEach((area, index) => {
            const metricInfo = this.metrics[area.metric];
            if (!metricInfo) return;

            const actions = this.generateMetricSpecificActions(
                area,
                metricInfo,
                difficultyPreference,
                timeHorizon
            );

            actionPlan.push({
                week: Math.floor(index / 2) + 1, // 2つのエリアずつ週ごとに集中
                focus: metricInfo.displayName,
                metric: area.metric,
                currentLevel: area.currentLevel,
                targetLevel: area.targetLevel,
                actions: actions,
                priority: area.priority,
                estimatedEffort: this.estimateEffort(area, difficultyPreference),
                expectedProgress: this.calculateWeeklyProgress(area, timeHorizon)
            });
        });

        // 強みを活かすアクションも追加
        if (strongAreas.length > 0) {
            const leverageActions = this.generateLeverageActions(strongAreas);
            actionPlan.push({
                week: Math.ceil(targetAreas.length / 2) + 1,
                focus: '強みの活用',
                metric: 'overall',
                actions: leverageActions,
                priority: 'medium',
                estimatedEffort: 'low',
                description: '既存の強みを更に伸ばして全体的なパフォーマンス向上を図ります'
            });
        }

        return actionPlan;
    }

    /**
     * 指標固有のアクションを生成
     * @param {Object} area - 対象エリア
     * @param {Object} metricInfo - 指標情報
     * @param {string} difficultyPreference - 難易度設定
     * @param {number} timeHorizon - 期間
     * @returns {Array} アクション
     */
    generateMetricSpecificActions(area, metricInfo, difficultyPreference, timeHorizon) {
        const actionTemplates = {
            score: [
                { action: '高得点バブルの優先的な狙い', difficulty: 'easy', effectiveness: 'medium' },
                { action: 'コンボ継続の練習', difficulty: 'medium', effectiveness: 'high' },
                { action: '特殊バブルの効果的な活用', difficulty: 'challenging', effectiveness: 'high' }
            ],
            accuracy: [
                { action: 'ゆっくり確実にクリックする練習', difficulty: 'easy', effectiveness: 'medium' },
                { action: '画面の端から順番に処理する', difficulty: 'medium', effectiveness: 'medium' },
                { action: '時間を意識しすぎない精度重視の練習', difficulty: 'easy', effectiveness: 'high' }
            ],
            playTime: [
                { action: '短時間集中セッションの実施', difficulty: 'easy', effectiveness: 'medium' },
                { action: '効率的なバブル処理パターンの習得', difficulty: 'medium', effectiveness: 'high' },
                { action: 'タイムアタックモードでの練習', difficulty: 'challenging', effectiveness: 'high' }
            ],
            completionRate: [
                { action: '簡単なステージでの確実なクリア', difficulty: 'easy', effectiveness: 'medium' },
                { action: 'HP管理の意識向上', difficulty: 'medium', effectiveness: 'high' },
                { action: '危険な状況での適切な判断練習', difficulty: 'challenging', effectiveness: 'high' }
            ]
        };

        const templates = actionTemplates[area.metric] || [
            { action: `${metricInfo.displayName}の基本練習`, difficulty: 'easy', effectiveness: 'medium' },
            { action: `${metricInfo.displayName}の応用テクニック習得`, difficulty: 'medium', effectiveness: 'high' }
        ];

        // 難易度設定に基づいてアクションをフィルタ
        const difficultyFilter = {
            easy: ['easy'],
            balanced: ['easy', 'medium'],
            challenging: ['easy', 'medium', 'hard']
        };

        const allowedDifficulties = difficultyFilter[difficultyPreference] || difficultyFilter['balanced'];
        const filteredTemplates = templates.filter(template => 
            allowedDifficulties.includes(template.difficulty)
        );

        return filteredTemplates.map(template => ({
            ...template,
            timeframe: this.calculateActionTimeframe(template.difficulty, timeHorizon),
            practiceFrequency: this.calculatePracticeFrequency(template.difficulty, difficultyPreference)
        }));
    }

    /**
     * 強みを活用するアクションを生成
     * @param {Array} strongAreas - 強みエリア
     * @returns {Array} 活用アクション
     */
    generateLeverageActions(strongAreas) {
        const leverageActions = [];

        strongAreas.forEach(area => {
            const metricInfo = this.metrics[area.metric];
            if (metricInfo) {
                leverageActions.push({
                    action: `${metricInfo.displayName}の強みを他の分野にも応用`,
                    difficulty: 'medium',
                    effectiveness: 'high',
                    description: `現在得意な${metricInfo.displayName}のスキルを他の指標向上にも活用しましょう`,
                    timeframe: '継続的',
                    practiceFrequency: '日常的'
                });
            }
        });

        if (leverageActions.length === 0) {
            leverageActions.push({
                action: 'バランスの取れたスキル向上',
                difficulty: 'medium',
                effectiveness: 'medium',
                description: '全ての指標をバランス良く向上させることを目指しましょう',
                timeframe: '継続的',
                practiceFrequency: '日常的'
            });
        }

        return leverageActions;
    }

    /**
     * 期待される成果を計算
     * @param {Array} targetAreas - 対象エリア
     * @param {number} timeHorizon - 期間
     * @returns {Array} 期待成果
     */
    calculateExpectedOutcomes(targetAreas, timeHorizon) {
        return targetAreas.map(area => {
            const metricInfo = this.metrics[area.metric];
            const improvementRate = this.calculateImprovementRate(area, timeHorizon);
            
            return {
                metric: area.metric,
                displayName: metricInfo ? metricInfo.displayName : area.metric,
                currentValue: area.currentLevel,
                expectedValue: area.currentLevel * (1 + improvementRate),
                improvementPercent: improvementRate * 100,
                timeframe: `${timeHorizon}日後`,
                confidence: this.calculateConfidence(area, timeHorizon)
            };
        });
    }

    /**
     * フォローアップアクションを生成
     * @param {Array} targetAreas - 対象エリア
     * @param {number} timeHorizon - 期間
     * @returns {Array} フォローアップアクション
     */
    generateFollowUpActions(targetAreas, timeHorizon) {
        const checkpoints = [];
        
        // 中間チェックポイント
        const midPoint = Math.floor(timeHorizon / 2);
        checkpoints.push({
            day: midPoint,
            action: 'progress_check',
            title: '中間進捗確認',
            description: '目標に向けた進捗を確認し、必要に応じて戦略を調整します',
            tasks: [
                '各指標の現在の値を測定',
                '改善ペースの評価',
                '困難な部分の特定',
                '必要に応じてアクションプランの調整'
            ]
        });

        // 最終評価
        checkpoints.push({
            day: timeHorizon,
            action: 'final_evaluation',
            title: '最終評価と次のステップ',
            description: '改善結果を評価し、次の改善サイクルの計画を立てます',
            tasks: [
                '全指標の最終値測定',
                '改善目標の達成度評価',
                '成功要因と課題の分析',
                '次の改善サイクルの目標設定'
            ]
        });

        return checkpoints;
    }

    /**
     * モチベーション要素を生成
     * @param {Array} strongAreas - 強みエリア
     * @param {Array} targetAreas - 対象エリア
     * @param {Object} comparisonResult - 比較結果
     * @returns {Object} モチベーション要素
     */
    generateMotivationalElements(strongAreas, targetAreas, comparisonResult) {
        const motivation = {
            achievements: [],
            encouragement: [],
            milestones: [],
            rewards: []
        };

        // 既存の成果を強調
        if (strongAreas.length > 0) {
            motivation.achievements.push(
                `${strongAreas.length}個の指標で優秀な成績を維持しています！`
            );
            
            strongAreas.forEach(area => {
                const metricInfo = this.metrics[area.metric];
                if (metricInfo && area.percentileRank) {
                    motivation.achievements.push(
                        `${metricInfo.displayName}では上位${100 - area.percentileRank}%の成績です`
                    );
                }
            });
        }

        // 励ましのメッセージ
        if (targetAreas.length > 0) {
            motivation.encouragement.push(
                '改善の余地があるということは、成長のチャンスがまだたくさんあるということです！'
            );
            
            const easiestTarget = targetAreas.find(area => area.priority !== 'high');
            if (easiestTarget) {
                const metricInfo = this.metrics[easiestTarget.metric];
                if (metricInfo) {
                    motivation.encouragement.push(
                        `特に${metricInfo.displayName}は短期間で改善が期待できる分野です`
                    );
                }
            }
        }

        // マイルストーン設定
        targetAreas.forEach(area => {
            const metricInfo = this.metrics[area.metric];
            if (metricInfo) {
                motivation.milestones.push({
                    metric: area.metric,
                    displayName: metricInfo.displayName,
                    milestones: [
                        {
                            target: area.currentLevel * 1.1,
                            description: `${metricInfo.displayName}が10%向上`
                        },
                        {
                            target: area.suggestedTarget,
                            description: `目標値（${metricInfo.format(area.suggestedTarget)}）達成`
                        }
                    ]
                });
            }
        });

        // 報酬提案
        motivation.rewards = [
            '小さな改善でも自分を褒めてあげましょう',
            '目標達成時は好きなことをして祝いましょう',
            '継続的な努力が最も価値のある成果です'
        ];

        return motivation;
    }

    /**
     * ヘルパーメソッド群
     */
    estimateEffort(area, difficultyPreference) {
        const baseEffort = { high: 'high', medium: 'medium', low: 'low' };
        const difficultyMultiplier = { 
            easy: 0.8, 
            balanced: 1.0, 
            challenging: 1.3 
        };
        
        const effort = baseEffort[area.priority] || 'medium';
        const multiplier = difficultyMultiplier[difficultyPreference] || 1.0;
        
        if (multiplier <= 0.8) return 'low';
        if (multiplier >= 1.3) return 'high';
        return effort;
    }

    calculateWeeklyProgress(area, timeHorizon) {
        const totalImprovement = (area.suggestedTarget - area.currentLevel) / area.currentLevel;
        const weeks = Math.ceil(timeHorizon / 7);
        return totalImprovement / weeks;
    }

    calculateActionTimeframe(difficulty, timeHorizon) {
        const timeframes = {
            easy: Math.min(3, Math.floor(timeHorizon / 3)),
            medium: Math.min(5, Math.floor(timeHorizon / 2)),
            challenging: timeHorizon
        };
        return `${timeframes[difficulty] || timeHorizon}日間`;
    }

    calculatePracticeFrequency(difficulty, difficultyPreference) {
        const frequencies = {
            easy: { easy: '週2-3回', balanced: '週3-4回', challenging: '毎日' },
            medium: { easy: '週3-4回', balanced: '週4-5回', challenging: '毎日' },
            challenging: { easy: '週4-5回', balanced: '毎日', challenging: '1日2回' }
        };
        return frequencies[difficulty]?.[difficultyPreference] || '週3-4回';
    }

    calculateImprovementRate(area, timeHorizon) {
        // 基本改善率（週当たり）
        const baseRate = 0.05; // 5%
        const priorityMultiplier = { high: 1.2, medium: 1.0, low: 0.8 };
        const weeks = timeHorizon / 7;
        
        return baseRate * weeks * (priorityMultiplier[area.priority] || 1.0);
    }

    calculateConfidence(area, timeHorizon) {
        // 信頼度は優先度、期間、改善可能性に基づく
        let confidence = 0.7; // ベース信頼度 70%
        
        if (area.priority === 'high') confidence += 0.1;
        if (timeHorizon >= 14) confidence += 0.1;
        if (area.improvementPotential > 20) confidence += 0.1;
        
        return Math.min(0.95, confidence); // 最大95%
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