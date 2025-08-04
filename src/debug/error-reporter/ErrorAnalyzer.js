/**
 * Error Analyzer
 * エラーパターン分析専用クラス
 */

export class ErrorAnalyzer {
    constructor(errorReporter) {
        this.errorReporter = errorReporter;
        
        // 分析設定
        this.analysisConfig = {
            patternSimilarityThreshold: 0.8,
            trendAnalysisWindow: 3600000, // 1時間
            frequencyAnalysisWindow: 1800000, // 30分
            criticalPatternThreshold: 10,
            correlationAnalysisEnabled: true
        };
        
        // 分析データキャッシュ
        this.analysisCache = new Map();
        this.cacheTimeout = 300000; // 5分
        
        // イベント相関分析
        this.eventCorrelations = new Map();
        this.userActionBuffer = [];
        this.maxActionBufferSize = 100;
    }
    
    /**
     * パターン分析
     */
    analyzePattern(error) {
        const fingerprint = error.fingerprint;
        
        if (!this.errorReporter.errorPatterns.has(fingerprint)) {
            this.errorReporter.errorPatterns.set(fingerprint, {
                fingerprint,
                count: 0,
                firstSeen: error.timestamp,
                lastSeen: error.timestamp,
                errors: [],
                trend: 'stable'
            });
        }
        
        const pattern = this.errorReporter.errorPatterns.get(fingerprint);
        pattern.count++;
        pattern.lastSeen = error.timestamp;
        pattern.errors.push(error.id);
        
        // トレンド分析
        this.updateTrend(pattern);
        
        // 相関分析
        if (this.analysisConfig.correlationAnalysisEnabled) {
            this.analyzeCorrelations(error, pattern);
        }
        
        // 類似パターンの検出
        this.detectSimilarPatterns(pattern);
        
        // クリティカルパターンの判定
        this.assessCriticalPattern(pattern);
        
        return pattern;
    }
    
    /**
     * トレンド更新
     */
    updateTrend(pattern) {
        const timeWindow = 300000; // 5分
        const recentErrors = pattern.errors.filter(errorId => {
            const error = this.errorReporter.errorCollector.collectedErrors.find(e => e.id === errorId);
            return error && (Date.now() - error.timestamp) < timeWindow;
        });
        
        if (recentErrors.length > pattern.count * 0.7) {
            pattern.trend = 'increasing';
        } else if (recentErrors.length < pattern.count * 0.3) {
            pattern.trend = 'decreasing';
        } else {
            pattern.trend = 'stable';
        }
    }
    
    /**
     * エラーと他のイベントとの相関分析
     */
    analyzeCorrelations(error, pattern) {
        const correlationKey = `${pattern.fingerprint}_correlations`;
        
        if (!this.eventCorrelations.has(correlationKey)) {
            this.eventCorrelations.set(correlationKey, {
                gameStates: new Map(),
                userActions: new Map(),
                systemEvents: new Map(),
                temporalPatterns: []
            });
        }
        
        const correlations = this.eventCorrelations.get(correlationKey);
        
        // ゲーム状態との相関
        if (error.context.gameState) {
            const gameState = error.context.gameState;
            const stateKey = `${gameState.currentScene}_${gameState.isRunning}_${gameState.isPaused}`;
            
            correlations.gameStates.set(stateKey, 
                (correlations.gameStates.get(stateKey) || 0) + 1
            );
        }
        
        // ユーザーアクション履歴との相関
        const recentActions = this.getRecentUserActions(error.timestamp, 30000); // 30秒以内
        recentActions.forEach(action => {
            correlations.userActions.set(action.type, 
                (correlations.userActions.get(action.type) || 0) + 1
            );
        });
        
        // 時間的パターンの分析
        this.analyzeTemporalPatterns(error, correlations);
    }
    
    /**
     * 類似パターンの検出
     */
    detectSimilarPatterns(currentPattern) {
        const similarities = [];
        
        for (const [fingerprint, pattern] of this.errorReporter.errorPatterns.entries()) {
            if (fingerprint === currentPattern.fingerprint) continue;
            
            const similarity = this.calculatePatternSimilarity(currentPattern, pattern);
            if (similarity > this.analysisConfig.patternSimilarityThreshold) {
                similarities.push({
                    pattern,
                    similarity,
                    potentialDuplicate: similarity > 0.95
                });
            }
        }
        
        if (similarities.length > 0) {
            currentPattern.similarPatterns = similarities;
            
            // 重複パターンの警告
            const duplicates = similarities.filter(s => s.potentialDuplicate);
            if (duplicates.length > 0) {
                console.warn(`Potential duplicate error patterns detected for ${currentPattern.fingerprint}`);
            }
        }
    }
    
    /**
     * クリティカルパターンの評価
     */
    assessCriticalPattern(pattern) {
        let criticalityScore = 0;
        
        // 頻度ベースの評価
        if (pattern.count > this.analysisConfig.criticalPatternThreshold) {
            criticalityScore += 3;
        }
        
        // トレンドベースの評価
        if (pattern.trend === 'increasing') {
            criticalityScore += 2;
        }
        
        // 相関ベースの評価
        const correlationKey = `${pattern.fingerprint}_correlations`;
        const correlations = this.eventCorrelations.get(correlationKey);
        
        if (correlations) {
            // ゲーム実行中のエラーは重要度が高い
            for (const [stateKey, count] of correlations.gameStates.entries()) {
                if (stateKey.includes('true_false') && count > 5) { // 実行中かつ非一時停止
                    criticalityScore += 2;
                }
            }
        }
        
        // 時間的集中度の評価
        const recentErrors = pattern.errors.slice(-10);
        if (recentErrors.length >= 5) {
            const timespan = pattern.lastSeen - pattern.firstSeen;
            const concentration = recentErrors.length / (timespan / 60000); // エラー/分
            
            if (concentration > 1) { // 1分に1回以上
                criticalityScore += 1;
            }
        }
        
        pattern.criticalityScore = criticalityScore;
        pattern.isCritical = criticalityScore >= 5;
        
        if (pattern.isCritical && !pattern.criticalAlertSent) {
            this.sendCriticalPatternAlert(pattern);
            pattern.criticalAlertSent = true;
        }
    }
    
    /**
     * パターン類似度の計算
     */
    calculatePatternSimilarity(pattern1, pattern2) {
        // フィンガープリントの類似度（編集距離ベース）
        const fingerprintSimilarity = this.calculateStringSimilarity(
            pattern1.fingerprint, 
            pattern2.fingerprint
        );
        
        // カテゴリの類似度
        const errors1 = this.getErrorsForPattern(pattern1);
        const errors2 = this.getErrorsForPattern(pattern2);
        
        const categories1 = new Set(errors1.map(e => e.category));
        const categories2 = new Set(errors2.map(e => e.category));
        
        const categoryIntersection = new Set([...categories1].filter(x => categories2.has(x)));
        const categoryUnion = new Set([...categories1, ...categories2]);
        
        const categorySimilarity = categoryIntersection.size / categoryUnion.size;
        
        // 重み付き平均
        return (fingerprintSimilarity * 0.7) + (categorySimilarity * 0.3);
    }
    
    /**
     * 文字列類似度の計算（レーベンシュタイン距離ベース）
     */
    calculateStringSimilarity(str1, str2) {
        const distance = this.levenshteinDistance(str1, str2);
        const maxLength = Math.max(str1.length, str2.length);
        return maxLength === 0 ? 1 : 1 - (distance / maxLength);
    }
    
    /**
     * レーベンシュタイン距離の計算
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * 時間的パターンの分析
     */
    analyzeTemporalPatterns(error, correlations) {
        const timestamp = error.timestamp;
        const hour = new Date(timestamp).getHours();
        const dayOfWeek = new Date(timestamp).getDay();
        
        correlations.temporalPatterns.push({
            timestamp,
            hour,
            dayOfWeek,
            gameTime: error.context.gameState?.gameTime || 0
        });
        
        // 最新100件のみ保持
        if (correlations.temporalPatterns.length > 100) {
            correlations.temporalPatterns.shift();
        }
    }
    
    /**
     * 最近のユーザーアクションの取得
     */
    getRecentUserActions(timestamp, timeWindow) {
        return this.userActionBuffer.filter(action => 
            timestamp - action.timestamp <= timeWindow
        );
    }
    
    /**
     * パターンに対応するエラーの取得
     */
    getErrorsForPattern(pattern) {
        return this.errorReporter.errorCollector.collectedErrors.filter(error =>
            pattern.errors.includes(error.id)
        );
    }
    
    /**
     * クリティカルパターンアラートの送信
     */
    sendCriticalPatternAlert(pattern) {
        const alert = {
            type: 'critical_pattern',
            pattern: {
                fingerprint: pattern.fingerprint,
                count: pattern.count,
                criticalityScore: pattern.criticalityScore,
                trend: pattern.trend
            },
            timestamp: Date.now(),
            recommendations: this.generatePatternRecommendations(pattern)
        };
        
        console.error('🚨 CRITICAL ERROR PATTERN DETECTED:', alert);
        
        // 開発者通知システムとの統合
        if (this.errorReporter.developerNotifications.enabled) {
            this.errorReporter.notifyDeveloper(
                new Error(`Critical pattern: ${pattern.fingerprint}`),
                'critical_pattern',
                alert
            );
        }
    }
    
    /**
     * パターン固有の推奨事項生成
     */
    generatePatternRecommendations(pattern) {
        const recommendations = [];
        const errors = this.getErrorsForPattern(pattern);
        
        // 頻度ベースの推奨事項
        if (pattern.count > 20) {
            recommendations.push({
                type: 'high_frequency',
                priority: 'critical',
                message: `エラーパターンが${pattern.count}回発生しています`,
                action: '根本原因の調査と修正を最優先で実施してください'
            });
        }
        
        // 相関ベースの推奨事項
        const correlationKey = `${pattern.fingerprint}_correlations`;
        const correlations = this.eventCorrelations.get(correlationKey);
        
        if (correlations) {
            // 特定のゲーム状態で多発している場合
            const topGameState = [...correlations.gameStates.entries()]
                .sort((a, b) => b[1] - a[1])[0];
                
            if (topGameState && topGameState[1] > pattern.count * 0.7) {
                recommendations.push({
                    type: 'state_correlation',
                    priority: 'high',
                    message: `特定のゲーム状態(${topGameState[0]})でエラーが集中しています`,
                    action: 'この状態での処理ロジックを重点的に確認してください'
                });
            }
        }
        
        // カテゴリベースの推奨事項
        const categories = [...new Set(errors.map(e => e.category))];
        if (categories.length === 1) {
            const category = categories[0];
            recommendations.push({
                type: 'category_specific',
                priority: 'medium',
                message: `全て${category}カテゴリのエラーです`,
                action: `${category}システムの包括的な診断を実施してください`
            });
        }
        
        return recommendations;
    }
    
    /**
     * ユーザーアクションの記録
     */
    recordUserAction(actionType, context = {}) {
        this.userActionBuffer.push({
            type: actionType,
            timestamp: Date.now(),
            context
        });
        
        // バッファサイズの制限
        if (this.userActionBuffer.length > this.maxActionBufferSize) {
            this.userActionBuffer.shift();
        }
    }
    
    /**
     * 高度な分析レポートの生成
     */
    generateAdvancedAnalysisReport() {
        const patterns = Array.from(this.errorReporter.errorPatterns.values());
        
        return {
            timestamp: Date.now(),
            summary: {
                totalPatterns: patterns.length,
                criticalPatterns: patterns.filter(p => p.isCritical).length,
                increasingTrends: patterns.filter(p => p.trend === 'increasing').length
            },
            criticalPatterns: patterns
                .filter(p => p.isCritical)
                .sort((a, b) => b.criticalityScore - a.criticalityScore)
                .slice(0, 10),
            similarityAnalysis: this.generateSimilarityReport(patterns),
            correlationAnalysis: this.generateCorrelationReport(),
            temporalAnalysis: this.generateTemporalReport(),
            recommendations: this.generateAdvancedRecommendations(patterns)
        };
    }
    
    /**
     * 類似度分析レポートの生成
     */
    generateSimilarityReport(patterns) {
        const similarityGroups = [];
        const processed = new Set();
        
        patterns.forEach(pattern => {
            if (processed.has(pattern.fingerprint)) return;
            
            const similar = patterns.filter(p => 
                !processed.has(p.fingerprint) && 
                p.similarPatterns?.some(sp => sp.similarity > 0.8)
            );
            
            if (similar.length > 1) {
                similarityGroups.push({
                    representative: pattern.fingerprint,
                    patterns: similar.map(p => p.fingerprint),
                    avgSimilarity: similar.reduce((sum, p) => {
                        const sim = p.similarPatterns?.find(sp => 
                            sp.pattern.fingerprint === pattern.fingerprint
                        );
                        return sum + (sim?.similarity || 0);
                    }, 0) / similar.length
                });
                
                similar.forEach(p => processed.add(p.fingerprint));
            }
        });
        
        return {
            totalGroups: similarityGroups.length,
            groups: similarityGroups,
            potentialDuplicates: similarityGroups.filter(g => g.avgSimilarity > 0.95).length
        };
    }
    
    /**
     * 相関分析レポートの生成
     */
    generateCorrelationReport() {
        const correlationSummary = {
            gameStateCorrelations: new Map(),
            userActionCorrelations: new Map(),
            strongCorrelations: []
        };
        
        for (const [key, correlations] of this.eventCorrelations.entries()) {
            // ゲーム状態相関の統計
            for (const [state, count] of correlations.gameStates.entries()) {
                correlationSummary.gameStateCorrelations.set(state, 
                    (correlationSummary.gameStateCorrelations.get(state) || 0) + count
                );
            }
            
            // ユーザーアクション相関の統計  
            for (const [action, count] of correlations.userActions.entries()) {
                correlationSummary.userActionCorrelations.set(action,
                    (correlationSummary.userActionCorrelations.get(action) || 0) + count
                );
            }
            
            // 強い相関の検出
            const topGameState = [...correlations.gameStates.entries()]
                .sort((a, b) => b[1] - a[1])[0];
                
            if (topGameState && topGameState[1] > 10) {
                correlationSummary.strongCorrelations.push({
                    pattern: key,
                    type: 'gameState',
                    correlatedWith: topGameState[0],
                    strength: topGameState[1]
                });
            }
        }
        
        return correlationSummary;
    }
    
    /**
     * 時間的分析レポートの生成
     */
    generateTemporalReport() {
        const temporalData = {
            hourlyDistribution: new Array(24).fill(0),
            dailyDistribution: new Array(7).fill(0),
            peakHours: [],
            peakDays: []
        };
        
        for (const correlations of this.eventCorrelations.values()) {
            correlations.temporalPatterns.forEach(pattern => {
                temporalData.hourlyDistribution[pattern.hour]++;
                temporalData.dailyDistribution[pattern.dayOfWeek]++;
            });
        }
        
        // ピーク時間の特定
        const avgHourly = temporalData.hourlyDistribution.reduce((a, b) => a + b, 0) / 24;
        temporalData.peakHours = temporalData.hourlyDistribution
            .map((count, hour) => ({ hour, count }))
            .filter(h => h.count > avgHourly * 1.5)
            .sort((a, b) => b.count - a.count);
            
        // ピーク曜日の特定
        const avgDaily = temporalData.dailyDistribution.reduce((a, b) => a + b, 0) / 7;
        temporalData.peakDays = temporalData.dailyDistribution
            .map((count, day) => ({ day, count }))
            .filter(d => d.count > avgDaily * 1.5)
            .sort((a, b) => b.count - a.count);
        
        return temporalData;
    }
    
    /**
     * 高度な推奨事項の生成
     */
    generateAdvancedRecommendations(patterns) {
        const recommendations = [];
        
        // クリティカルパターンの推奨事項
        const criticalPatterns = patterns.filter(p => p.isCritical);
        if (criticalPatterns.length > 0) {
            recommendations.push({
                type: 'critical_patterns',
                priority: 'critical',
                count: criticalPatterns.length,
                message: `${criticalPatterns.length}個のクリティカルエラーパターンが検出されました`,
                action: '緊急対応が必要です。開発チームに即座に報告してください',
                details: criticalPatterns.slice(0, 5).map(p => ({
                    pattern: p.fingerprint,
                    score: p.criticalityScore,
                    count: p.count
                }))
            });
        }
        
        // 類似パターンの推奨事項
        const similarPatterns = patterns.filter(p => p.similarPatterns?.length > 0);
        if (similarPatterns.length > 0) {
            recommendations.push({
                type: 'pattern_consolidation',
                priority: 'medium',
                count: similarPatterns.length,
                message: '類似のエラーパターンが検出されました',
                action: 'パターンの統合と根本原因の調査を検討してください'
            });
        }
        
        return recommendations;
    }
    
    /**
     * レポート生成
     */
    generateReport(timeframe = 'session') {
        const errors = this.getErrorsForTimeframe(timeframe);
        
        return {
            timeframe,
            sessionId: this.errorReporter.sessionId,
            generatedAt: Date.now(),
            summary: {
                total: errors.length,
                bySeverity: this.groupBy(errors, 'severity'),
                byCategory: this.groupBy(errors, 'category'),
                uniquePatterns: this.errorReporter.errorPatterns.size
            },
            patterns: Array.from(this.errorReporter.errorPatterns.values()),
            recentErrors: errors.slice(-10),
            recommendations: this.generateRecommendations(errors)
        };
    }
    
    /**
     * 時間枠でのエラー取得
     */
    getErrorsForTimeframe(timeframe) {
        const now = Date.now();
        let timeLimit = 0;
        
        switch (timeframe) {
            case 'last_hour':
                timeLimit = now - 3600000;
                break;
            case 'last_day':
                timeLimit = now - 86400000;
                break;
            case 'session':
            default:
                timeLimit = this.errorReporter.sessionStartTime;
                break;
        }
        
        return this.errorReporter.errorCollector.collectedErrors
            .filter(error => error.timestamp >= timeLimit);
    }
    
    /**
     * グループ化ユーティリティ
     */
    groupBy(errors, property) {
        return errors.reduce((groups, error) => {
            const key = error[property];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }
    
    /**
     * 推奨事項の生成
     */
    generateRecommendations(errors) {
        const recommendations = [];
        
        // 高頻度エラーのチェック
        const highFrequencyPatterns = Array.from(this.errorReporter.errorPatterns.values())
            .filter(pattern => pattern.count > 5);
        
        if (highFrequencyPatterns.length > 0) {
            recommendations.push({
                type: 'high_frequency',
                message: `${highFrequencyPatterns.length}個のエラーパターンが高頻度で発生しています`,
                action: 'これらのパターンを優先的に修正してください',
                patterns: highFrequencyPatterns.slice(0, 3)
            });
        }
        
        // メモリ関連エラーのチェック
        const memoryErrors = errors.filter(error => 
            error.message.toLowerCase().includes('memory') ||
            error.category === 'memory'
        );
        
        if (memoryErrors.length > 0) {
            recommendations.push({
                type: 'memory_issues',
                message: `${memoryErrors.length}個のメモリ関連エラーが検出されました`,
                action: 'メモリリークの調査を推奨します'
            });
        }
        
        return recommendations;
    }
    
    /**
     * 統計情報の取得
     */
    getStatistics() {
        const errors = this.errorReporter.errorCollector.collectedErrors;
        
        return {
            sessionDuration: Date.now() - this.errorReporter.sessionStartTime,
            totalErrors: errors.length,
            errorRate: this.calculateErrorRate(errors),
            severityDistribution: this.groupBy(errors, 'severity'),
            categoryDistribution: this.groupBy(errors, 'category'),
            patternCount: this.errorReporter.errorPatterns.size,
            topPatterns: this.getTopPatterns(5)
        };
    }
    
    /**
     * エラーレートの計算
     */
    calculateErrorRate(errors) {
        const sessionDuration = Date.now() - this.errorReporter.sessionStartTime;
        const hours = sessionDuration / 3600000;
        return hours > 0 ? (errors.length / hours).toFixed(2) : 0;
    }
    
    /**
     * トップパターンの取得
     */
    getTopPatterns(limit = 5) {
        return Array.from(this.errorReporter.errorPatterns.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}