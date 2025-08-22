/**
 * 異常パターン検出システム
 * 統計的手法を用いて異常なプレイパターンを検出し、注意喚起メッセージを生成します
 */
export class AnomalyDetector {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.detectionRules = new Map();
        this.alertHistory = [];
        this.maxAlertHistory = 100;
        
        // 検出閾値設定
        this.thresholds = {
            statistical: 2.5,      // 統計的異常値（標準偏差倍数）
            behavioral: 0.8,       // 行動パターン異常値（0-1）
            performance: 3.0,      // パフォーマンス異常値（標準偏差倍数）
            temporal: 0.9          // 時間的異常値（0-1）
        };
        
        // 異常パターンタイプ
        this.anomalyTypes = {
            SCORE_OUTLIER: 'score_outlier',
            ACCURACY_DROP: 'accuracy_drop',
            PLAY_TIME_ANOMALY: 'play_time_anomaly',
            COMBO_INCONSISTENCY: 'combo_inconsistency',
            BUBBLE_INTERACTION_ANOMALY: 'bubble_interaction_anomaly',
            SESSION_FREQUENCY_ANOMALY: 'session_frequency_anomaly',
            PERFORMANCE_DEGRADATION: 'performance_degradation',
            UNUSUAL_QUIT_PATTERN: 'unusual_quit_pattern'
        };
        
        this.initializeDetectionRules();
    }

    /**
     * 検出ルールを初期化
     */
    initializeDetectionRules() {
        // スコア異常値検出
        this.detectionRules.set(this.anomalyTypes.SCORE_OUTLIER, {
            detect: (data) => this.detectScoreOutliers(data),
            severity: 'medium',
            description: 'スコアに異常な変動が検出されました'
        });
        
        // 精度急降下検出
        this.detectionRules.set(this.anomalyTypes.ACCURACY_DROP, {
            detect: (data) => this.detectAccuracyDrop(data),
            severity: 'high',
            description: '精度が急激に低下しています'
        });
        
        // プレイ時間異常検出
        this.detectionRules.set(this.anomalyTypes.PLAY_TIME_ANOMALY, {
            detect: (data) => this.detectPlayTimeAnomaly(data),
            severity: 'low',
            description: 'プレイ時間に異常なパターンが見られます'
        });
        
        // コンボ一貫性異常検出
        this.detectionRules.set(this.anomalyTypes.COMBO_INCONSISTENCY, {
            detect: (data) => this.detectComboInconsistency(data),
            severity: 'medium',
            description: 'コンボパフォーマンスに一貫性がありません'
        });
        
        // バブルインタラクション異常検出
        this.detectionRules.set(this.anomalyTypes.BUBBLE_INTERACTION_ANOMALY, {
            detect: (data) => this.detectBubbleInteractionAnomaly(data),
            severity: 'high',
            description: 'バブル操作パターンに異常が検出されました'
        });
        
        // セッション頻度異常検出
        this.detectionRules.set(this.anomalyTypes.SESSION_FREQUENCY_ANOMALY, {
            detect: (data) => this.detectSessionFrequencyAnomaly(data),
            severity: 'low',
            description: 'セッション頻度に異常なパターンがあります'
        });
        
        // パフォーマンス劣化検出
        this.detectionRules.set(this.anomalyTypes.PERFORMANCE_DEGRADATION, {
            detect: (data) => this.detectPerformanceDegradation(data),
            severity: 'high',
            description: 'システムパフォーマンスの劣化が検出されました'
        });
        
        // 異常な終了パターン検出
        this.detectionRules.set(this.anomalyTypes.UNUSUAL_QUIT_PATTERN, {
            detect: (data) => this.detectUnusualQuitPattern(data),
            severity: 'medium',
            description: '異常な終了パターンが検出されました'
        });
    }

    /**
     * 異常パターン検出を実行
     * @param {string} dataType - 検出対象のデータタイプ
     * @param {Object} options - 検出オプション
     * @returns {Promise<Object>} 検出結果
     */
    async detectAnomalies(dataType = 'all', options: any = {}) {
        try {
            const {
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate = new Date(),
                includeMinor = false
            } = options;
            
            const sessionData = await this.storageManager.getData('sessions', {
                startDate,
                endDate
            });
            
            const interactionData = await this.storageManager.getData('interactions', {
                startDate,
                endDate
            });
            
            const performanceData = await this.storageManager.getData('performance', {
                startDate,
                endDate
            });

            if (sessionData.length === 0) {
                return {
                    success: true,
                    anomalies: [],
                    summary: '分析対象データが不足しています',
                    recommendations: []
                };
            }

            // 異常検出実行
            const detectionResults = [];
            
            for (const [type, rule] of this.detectionRules.entries()) {
                try {
                    const anomalies = await rule.detect({
                        sessions: sessionData,
                        interactions: interactionData,
                        performance: performanceData
                    });
                    
                    if (anomalies && anomalies.length > 0) {
                        detectionResults.push({
                            type: type,
                            severity: rule.severity,
                            description: rule.description,
                            anomalies: anomalies,
                            detectedAt: new Date()
                        });
                    }
                } catch (error) {
                    console.warn(`異常検出エラー (${type}):`, error);
                }
            }

            // 結果をフィルタリング
            let filteredResults = detectionResults;
            if (!includeMinor) {
                filteredResults = detectionResults.filter(result => 
                    result.severity !== 'low'
                );
            }

            // アラート履歴に保存
            this.saveToAlertHistory(filteredResults);

            // サマリーと推奨事項を生成
            const summary = this.generateAnomalySummary(filteredResults);
            const recommendations = this.generateRecommendations(filteredResults);

            return {
                success: true,
                anomalies: filteredResults,
                totalAnomalies: filteredResults.length,
                severityBreakdown: this.calculateSeverityBreakdown(filteredResults),
                summary: summary,
                recommendations: recommendations,
                detectionPeriod: {
                    start: startDate,
                    end: endDate
                }
            };
        } catch (error) {
            console.error('異常パターン検出エラー:', error);
            return {
                success: false,
                error: error.message,
                anomalies: []
            };
        }
    }

    /**
     * スコア異常値を検出
     */
    detectScoreOutliers(data) {
        const scores = data.sessions.map(s => s.finalScore || 0);
        if (scores.length < 5) return [];

        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) return [];

        const outliers = [];
        data.sessions.forEach((session, index) => {
            const zScore = Math.abs((session.finalScore - mean) / stdDev);
            if (zScore > this.thresholds.statistical) {
                outliers.push({
                    sessionId: session.sessionId,
                    timestamp: session.startTime,
                    value: session.finalScore,
                    expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
                    zScore: zScore,
                    deviation: session.finalScore - mean
                });
            }
        });

        return outliers;
    }

    /**
     * 精度急降下を検出
     */
    detectAccuracyDrop(data) {
        const accuracies = data.sessions.map(s => {
            const total = (s.bubblesPopped || 0) + (s.bubblesMissed || 0);
            return total > 0 ? (s.bubblesPopped || 0) / total : 0;
        });

        if (accuracies.length < 3) return [];

        const drops = [];
        for (let i = 2; i < accuracies.length; i++) {
            const recentAvg = (accuracies[i-2] + accuracies[i-1]) / 2;
            const currentAccuracy = accuracies[i];
            
            if (recentAvg > 0.5 && currentAccuracy < recentAvg * this.thresholds.behavioral) {
                drops.push({
                    sessionId: data.sessions[i].sessionId,
                    timestamp: data.sessions[i].startTime,
                    currentAccuracy: currentAccuracy,
                    previousAccuracy: recentAvg,
                    dropPercentage: ((recentAvg - currentAccuracy) / recentAvg) * 100
                });
            }
        }
        
        return drops;
    }

    /**
     * プレイ時間異常を検出
     */
    detectPlayTimeAnomaly(data) {
        const playTimes = data.sessions.map(s => {
            if (s.endTime && s.startTime) {
                return (s.endTime - s.startTime) / 1000;
            }
            return s.duration || 0;
        });

        if (playTimes.length < 5) return [];

        const mean = playTimes.reduce((a, b) => a + b, 0) / playTimes.length;
        const variance = playTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / playTimes.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return [];

        const anomalies = [];
        data.sessions.forEach((session, index) => {
            const playTime = playTimes[index];
            const zScore = Math.abs((playTime - mean) / stdDev);

            if (zScore > this.thresholds.statistical) {
                anomalies.push({
                    sessionId: session.sessionId,
                    timestamp: session.startTime,
                    playTime: playTime,
                    expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
                    zScore: zScore,
                    anomalyType: playTime > mean ? 'unusually_long' : 'unusually_short'
                });
            }
        });

        return anomalies;
    }

    /**
     * コンボ一貫性異常を検出
     */
    detectComboInconsistency(data) {
        const combos = data.sessions.map(s => s.maxCombo || 0);
        if (combos.length < 5) return [];

        // 移動平均と標準偏差を計算
        const windowSize = Math.min(5, combos.length);
        const inconsistencies = [];

        for (let i = windowSize; i < combos.length; i++) {
            const window = combos.slice(i - windowSize, i);
            const windowMean = window.reduce((a, b) => a + b, 0) / window.length;
            const windowStdDev = Math.sqrt(
                window.reduce((sum, combo) => sum + Math.pow(combo - windowMean, 2), 0) / window.length
            );

            const currentCombo = combos[i];
            const consistency = windowStdDev > 0 ? 
                1 - Math.abs(currentCombo - windowMean) / (windowStdDev * 3) : 1;

            if (consistency < this.thresholds.behavioral) {
                inconsistencies.push({
                    sessionId: data.sessions[i].sessionId,
                    timestamp: data.sessions[i].startTime,
                    currentCombo: currentCombo,
                    expectedCombo: windowMean,
                    consistencyScore: consistency,
                    variability: windowStdDev
                });
            }
        }

        return inconsistencies;
    }

    /**
     * バブルインタラクション異常を検出
     */
    detectBubbleInteractionAnomaly(data) {
        if (!data.interactions || data.interactions.length === 0) return [];

        // セッション別にインタラクションを分析
        const sessionGroups = new Map();
        data.interactions.forEach(interaction => {
            if (!sessionGroups.has(interaction.sessionId)) {
                sessionGroups.set(interaction.sessionId, []);
            }
            sessionGroups.get(interaction.sessionId).push(interaction);
        });

        const anomalies = [];
        sessionGroups.forEach((interactions, sessionId) => {
            const reactionTimes = interactions
                .filter(i => i.reactionTime && i.reactionTime > 0)
                .map(i => i.reactionTime);
            
            if (reactionTimes.length < 5) return;

            const mean = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
            const stdDev = Math.sqrt(
                reactionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / reactionTimes.length
            );

            // 異常に遅い反応時間の検出
            const slowReactions = reactionTimes.filter(time => 
                stdDev > 0 && (time - mean) / stdDev > this.thresholds.statistical
            );

            if (slowReactions.length > reactionTimes.length * 0.2) {
                anomalies.push({
                    sessionId: sessionId,
                    timestamp: interactions[0].timestamp,
                    anomalyType: 'slow_reactions',
                    averageReactionTime: mean,
                    slowReactionCount: slowReactions.length,
                    totalReactions: reactionTimes.length,
                    slowReactionRatio: slowReactions.length / reactionTimes.length
                });
            }
        });

        return anomalies;
    }

    /**
     * セッション頻度異常を検出
     */
    detectSessionFrequencyAnomaly(data) {
        if (data.sessions.length < 7) return [];

        // 日別セッション数を計算
        const dailySessions = new Map();
        data.sessions.forEach(session => {
            const date = new Date(session.startTime).toDateString();
            dailySessions.set(date, (dailySessions.get(date) || 0) + 1);
        });

        const sessionCounts = Array.from(dailySessions.values());
        const mean = sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length;
        const stdDev = Math.sqrt(
            sessionCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / sessionCounts.length
        );

        if (stdDev === 0) return [];

        const anomalies = [];
        dailySessions.forEach((count, date) => {
            const zScore = Math.abs((count - mean) / stdDev);
            if (zScore > this.thresholds.statistical) {
                anomalies.push({
                    date: date,
                    sessionCount: count,
                    expectedRange: [mean - 2 * stdDev, mean + 2 * stdDev],
                    zScore: zScore,
                    anomalyType: count > mean ? 'excessive_sessions' : 'insufficient_sessions'
                });
            }
        });

        return anomalies;
    }

    /**
     * パフォーマンス劣化を検出
     */
    detectPerformanceDegradation(data) {
        if (!data.performance || data.performance.length < 10) return [];

        const fpsData = data.performance.map(p => p.fps).filter(fps => fps > 0);
        if (fpsData.length < 5) return [];

        const mean = fpsData.reduce((a, b) => a + b, 0) / fpsData.length;
        const lowPerformanceCount = fpsData.filter(fps => fps < 30).length;
        const degradationRatio = lowPerformanceCount / fpsData.length;

        if (degradationRatio > 0.3) { // 30%以上が低フレームレート
            return [{
                timestamp: Date.now(),
                severity: degradationRatio > 0.5 ? 'critical' : 'warning',
                degradationRatio: degradationRatio,
                averageFps: mean,
                lowPerformanceCount: lowPerformanceCount,
                totalMeasurements: fpsData.length
            }];
        }

        return [];
    }

    /**
     * 異常な終了パターンを検出
     */
    detectUnusualQuitPattern(data) {
        const quitSessions = data.sessions.filter(s => s.exitReason === 'quit');
        const totalSessions = data.sessions.length;

        if (totalSessions < 10) return [];

        const quitRatio = quitSessions.length / totalSessions;
        
        if (quitRatio > 0.4) { // 40%以上が途中終了
            // 終了タイミングを分析
            const quitTimes = quitSessions.map(s => {
                const duration = s.endTime ? 
                    (s.endTime - s.startTime) / 1000 : s.duration || 0;
                return duration;
            });

            const averageQuitTime = quitTimes.reduce((a, b) => a + b, 0) / quitTimes.length;

            return [{
                timestamp: Date.now(),
                pattern: averageQuitTime < 60 ? 'early_quit' : 'mid_game_quit',
                quitRatio: quitRatio,
                averageQuitTime: averageQuitTime,
                quitCount: quitSessions.length,
                totalSessions: totalSessions
            }];
        }

        return [];
    }

    /**
     * 重要度別の分布を計算
     */
    calculateSeverityBreakdown(results) {
        const breakdown = { low: 0, medium: 0, high: 0, critical: 0 };
        results.forEach(result => {
            breakdown[result.severity] = (breakdown[result.severity] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * 異常検出サマリーを生成
     */
    generateAnomalySummary(results) {
        if (results.length === 0) {
            return '異常なパターンは検出されませんでした。';
        }

        const severityBreakdown = this.calculateSeverityBreakdown(results);
        const highPriorityCount = severityBreakdown.high + (severityBreakdown.critical || 0);
        
        let summary = `${results.length}件の異常パターンが検出されました。`;
        
        if (highPriorityCount > 0) {
            summary += ` うち${highPriorityCount}件は高優先度の問題です。`;
        }

        // 最も一般的な異常タイプを特定
        const typeCount = new Map();
        results.forEach(result => {
            typeCount.set(result.type, (typeCount.get(result.type) || 0) + 1);
        });

        const mostCommonType = Array.from(typeCount.entries())
            .sort((a, b) => b[1] - a[1])[0];

        if (mostCommonType) {
            summary += ` 最も多い問題は「${this.getTypeDisplayName(mostCommonType[0])}」です。`;
        }

        return summary;
    }

    /**
     * 推奨事項を生成
     */
    generateRecommendations(results) {
        const recommendations = [];
        const typeCount = new Map();
        
        results.forEach(result => {
            typeCount.set(result.type, (typeCount.get(result.type) || 0) + 1);
        });

        // タイプ別の推奨事項
        typeCount.forEach((count, type) => {
            const recommendation = this.getRecommendationForType(type, count);
            if (recommendation) {
                recommendations.push(recommendation);
            }
        });

        return recommendations;
    }

    /**
     * タイプ別の推奨事項を取得
     */
    getRecommendationForType(type, count) {
        const recommendations = {
            [this.anomalyTypes.SCORE_OUTLIER]: 'スコアの変動が大きいです。ゲームバランスの調整を検討してください。',
            [this.anomalyTypes.ACCURACY_DROP]: '精度が低下しています。操作方法の確認や練習をお勧めします。',
            [this.anomalyTypes.PLAY_TIME_ANOMALY]: 'プレイ時間に変化があります。プレイスタイルの見直しを検討してください。',
            [this.anomalyTypes.COMBO_INCONSISTENCY]: 'コンボの安定性に課題があります。集中力の維持を心がけてください。',
            [this.anomalyTypes.BUBBLE_INTERACTION_ANOMALY]: '操作レスポンスに問題があります。デバイスや設定の確認をお勧めします。',
            [this.anomalyTypes.SESSION_FREQUENCY_ANOMALY]: 'プレイ頻度に変化があります。適度な休憩を取ることをお勧めします。',
            [this.anomalyTypes.PERFORMANCE_DEGRADATION]: 'システム性能に問題があります。デバイスの最適化を検討してください。',
            [this.anomalyTypes.UNUSUAL_QUIT_PATTERN]: '途中終了が多くなっています。ゲーム体験の改善を検討してください。'
        };

        return recommendations[type] || null;
    }

    /**
     * タイプの表示名を取得
     */
    getTypeDisplayName(type) {
        const displayNames = {
            [this.anomalyTypes.SCORE_OUTLIER]: 'スコア異常',
            [this.anomalyTypes.ACCURACY_DROP]: '精度低下',
            [this.anomalyTypes.PLAY_TIME_ANOMALY]: 'プレイ時間異常',
            [this.anomalyTypes.COMBO_INCONSISTENCY]: 'コンボ不安定',
            [this.anomalyTypes.BUBBLE_INTERACTION_ANOMALY]: '操作異常',
            [this.anomalyTypes.SESSION_FREQUENCY_ANOMALY]: '頻度異常',
            [this.anomalyTypes.PERFORMANCE_DEGRADATION]: '性能劣化',
            [this.anomalyTypes.UNUSUAL_QUIT_PATTERN]: '異常終了'
        };

        return displayNames[type] || type;
    }

    /**
     * アラート履歴に保存
     */
    saveToAlertHistory(results) {
        const timestamp = Date.now();
        results.forEach(result => {
            this.alertHistory.push({
                ...result,
                id: `alert_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: timestamp
            });
        });

        // 履歴サイズを制限
        if (this.alertHistory.length > this.maxAlertHistory) {
            this.alertHistory = this.alertHistory.slice(-this.maxAlertHistory);
        }
    }

    /**
     * アラート履歴を取得
     */
    getAlertHistory(limit = 50) {
        return this.alertHistory
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * 閾値を更新
     */
    updateThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.alertHistory = [];
    }
}