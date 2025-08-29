/**
 * HelpMetricsCollector
 * 使用メトリクス収集、エンゲージメントデータ、セッション管理を担当
 */
export class HelpMetricsCollector {
    constructor(helpEffectivenessAnalyzer) {
        this.helpEffectivenessAnalyzer = helpEffectivenessAnalyzer;
        this.gameEngine = helpEffectivenessAnalyzer.gameEngine;
        this.loggingSystem = helpEffectivenessAnalyzer.loggingSystem;
        
        // 設定
        this.config = {
            minDataThreshold: 5,
            dataCollectionInterval: 60000 // 1分間隔
        };
        
        // メトリクス収集状態
        this.collectionState = {
            isActive: false,
            lastCollectionTime: 0,
            collectionQueue: []
        };
        
        console.log('[HelpMetricsCollector] Component initialized');
    }
    
    /**
     * 生データの収集
     * @param {string} period - 分析期間
     * @returns {Object} 収集されたデータ
     */
    async collectRawData(period) {
        const rawData = {
            analytics: null,
            feedback: null,
            sessions: [],
            interactions: [],
            timestamp: Date.now()
        };
        
        try {
            // アナリティクスデータの収集
            if (this.helpEffectivenessAnalyzer.helpAnalytics) {
                rawData.analytics = this.helpEffectivenessAnalyzer.helpAnalytics.generateReport('detailed', { period });
                rawData.sessions = Array.from(this.helpEffectivenessAnalyzer.helpAnalytics.sessions.values());
            }
            
            // フィードバックデータの収集
            if (this.helpEffectivenessAnalyzer.helpFeedbackSystem) {
                rawData.feedback = this.helpEffectivenessAnalyzer.helpFeedbackSystem.getFeedbackStatistics();
                rawData.interactions = Array.from(this.helpEffectivenessAnalyzer.helpFeedbackSystem.feedbacks.entries());
            }
            
            this.loggingSystem.debug('HelpMetricsCollector', `Raw data collected for period: ${period}`);
            return rawData;
            
        } catch (error) {
            this.loggingSystem.error('HelpMetricsCollector', 'Failed to collect raw data', error);
            throw error;
        }
    }
    
    /**
     * 使用率指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} 使用率分析結果
     */
    analyzeUsageMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            if (rawData.analytics && rawData.analytics.data) {
                const analyticsData = rawData.analytics.data;
                
                // 基本使用統計
                analysis.summary = {
                    totalSessions: analyticsData.overview?.totalHelpSessions || 0,
                    uniqueUsers: analyticsData.overview?.uniqueUsers || 0,
                    averageSessionDuration: analyticsData.overview?.averageSessionDuration || 0,
                    pageViewsPerSession: this.calculatePageViewsPerSession(rawData.sessions),
                    searchUsageRate: this.calculateSearchUsageRate(rawData.sessions),
                    returnUserRate: this.calculateReturnUserRate(rawData.sessions)
                };
                
                // 詳細分析
                analysis.details = {
                    topCategories: analyticsData.topContent?.categories || [],
                    topTopics: analyticsData.topContent?.topics || [],
                    searchQueries: analyticsData.topContent?.searchQueries || [],
                    sessionDistribution: this.analyzeSessionDistribution(rawData.sessions),
                    usagePatterns: this.analyzeUsagePatterns(rawData.sessions)
                };
                
                // インサイト生成
                analysis.insights = this.generateUsageInsights(analysis.summary, analysis.details);
            }
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpMetricsCollector', 'Failed to analyze usage metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * エンゲージメント指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} エンゲージメント分析結果
     */
    analyzeEngagementMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            // エンゲージメント指標の計算
            analysis.summary = {
                averageTimePerTopic: this.calculateAverageTimePerTopic(rawData.sessions),
                interactionRate: this.calculateInteractionRate(rawData.sessions, rawData.interactions),
                searchSuccessRate: this.calculateSearchSuccessRate(rawData.sessions),
                navigationEfficiency: this.calculateNavigationEfficiency(rawData.sessions),
                contentCompletionRate: this.calculateContentCompletionRate(rawData.sessions)
            };
            
            // 詳細エンゲージメント分析
            analysis.details = {
                topicEngagement: this.analyzeTopicEngagement(rawData.sessions),
                searchBehavior: this.analyzeSearchBehavior(rawData.sessions),
                navigationPatterns: this.analyzeNavigationPatterns(rawData.sessions),
                dropoffPoints: this.identifyDropoffPoints(rawData.sessions),
                peakUsageTimes: this.analyzePeakUsageTimes(rawData.sessions)
            };
            
            // エンゲージメントインサイト
            analysis.insights = this.generateEngagementInsights(analysis.summary, analysis.details);
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpMetricsCollector', 'Failed to analyze engagement metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * 満足度指標の分析
     * @param {Object} rawData - 生データ
     * @returns {Object} 満足度分析結果
     */
    analyzeSatisfactionMetrics(rawData) {
        try {
            const analysis = {
                summary: {},
                details: {},
                insights: []
            };
            
            if (rawData.feedback) {
                // 基本満足度指標
                analysis.summary = {
                    averageRating: rawData.feedback.averageRating || 0,
                    helpfulnessRate: rawData.feedback.helpfulPercentage || 0,
                    totalFeedbacks: rawData.feedback.totalFeedbacks || 0,
                    ratingDistribution: rawData.feedback.ratingDistribution || {},
                    sentimentScore: this.calculateSentimentScore(rawData.interactions)
                };
                
                // 詳細満足度分析
                analysis.details = {
                    topRatedContent: rawData.feedback.topRatedContent || [],
                    lowRatedContent: rawData.feedback.lowRatedContent || [],
                    feedbackCategories: rawData.feedback.commonCategories || new Map(),
                    improvementAreas: this.identifyImprovementAreas(rawData.interactions),
                    userSentiments: this.analyzeUserSentiments(rawData.interactions)
                };
                
                // 満足度インサイト
                analysis.insights = this.generateSatisfactionInsights(analysis.summary, analysis.details);
            }
            
            return analysis;
            
        } catch (error) {
            this.loggingSystem.error('HelpMetricsCollector', 'Failed to analyze satisfaction metrics', error);
            return { summary: {}, details: {}, insights: [] };
        }
    }
    
    /**
     * データ品質の検証
     * @param {Object} rawData - 生データ
     * @returns {boolean} データ品質が十分かどうか
     */
    validateDataQuality(rawData) {
        try {
            // 最小データ数の確認
            const sessionCount = rawData.sessions ? rawData.sessions.length : 0;
            const feedbackCount = rawData.interactions ? rawData.interactions.length : 0;
            
            if (sessionCount < this.config.minDataThreshold && feedbackCount < this.config.minDataThreshold) {
                this.loggingSystem.warn('HelpMetricsCollector', 
                    `Insufficient data: sessions=${sessionCount}, feedback=${feedbackCount}`);
                return false;
            }
            
            // データの整合性確認
            if (rawData.analytics && rawData.analytics.error) {
                this.loggingSystem.warn('HelpMetricsCollector', 'Analytics data contains errors');
                return false;
            }
            
            return true;
            
        } catch (error) {
            this.loggingSystem.error('HelpMetricsCollector', 'Data quality validation failed', error);
            return false;
        }
    }
    
    /**
     * データ品質の評価
     * @param {Object} rawData - 生データ
     * @returns {number} データ品質スコア (0-1)
     */
    assessDataQuality(rawData) {
        const sessionCount = rawData.sessions ? rawData.sessions.length : 0;
        const feedbackCount = rawData.interactions ? rawData.interactions.length : 0;
        
        let quality = 0;
        if (sessionCount >= 50) quality += 0.4;
        else if (sessionCount >= 20) quality += 0.3;
        else if (sessionCount >= 5) quality += 0.2;
        
        if (feedbackCount >= 20) quality += 0.4;
        else if (feedbackCount >= 10) quality += 0.3;
        else if (feedbackCount >= 3) quality += 0.2;
        
        if (rawData.analytics && !rawData.analytics.error) quality += 0.2;
        
        return Math.min(quality, 1.0);
    }
    
    /**
     * データボリュームの計算
     * @param {Object} rawData - 生データ
     * @returns {Object} データボリューム情報
     */
    calculateDataVolume(rawData) {
        return {
            sessions: rawData.sessions ? rawData.sessions.length : 0,
            feedback: rawData.interactions ? rawData.interactions.length : 0,
            analytics_events: rawData.analytics ? 
                (rawData.analytics.data?.overview?.totalPageViews || 0) : 0
        };
    }
    
    /**
     * 信頼度レベルの計算
     * @param {Object} rawData - 生データ
     * @returns {number} 信頼度 (0-1)
     */
    calculateConfidenceLevel(rawData) {
        const dataQuality = this.assessDataQuality(rawData);
        const dataVolume = this.calculateDataVolume(rawData);
        
        // データ量とデータ品質から信頼度を計算
        let confidence = dataQuality * 0.6;
        
        // セッション数による信頼度調整
        if (dataVolume.sessions >= 100) confidence += 0.3;
        else if (dataVolume.sessions >= 50) confidence += 0.2;
        else if (dataVolume.sessions >= 20) confidence += 0.1;
        
        // フィードバック数による信頼度調整
        if (dataVolume.feedback >= 50) confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }
    
    // ========== 計算ヘルパーメソッド ==========
    
    calculatePageViewsPerSession(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const totalPageViews = sessions.reduce((sum, session) => {
            return sum + (session.pageViews ? session.pageViews.length : 0);
        }, 0);
        
        return totalPageViews / sessions.length;
    }
    
    calculateSearchUsageRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const sessionsWithSearch = sessions.filter(session => 
            session.searchQueries && session.searchQueries.length > 0
        ).length;
        
        return sessionsWithSearch / sessions.length;
    }
    
    calculateReturnUserRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        // 簡単な実装: 同じentryPointを持つセッションの比率で推定
        const entryPoints = new Map();
        sessions.forEach(session => {
            const count = entryPoints.get(session.entryPoint) || 0;
            entryPoints.set(session.entryPoint, count + 1);
        });
        
        const returningSessions = Array.from(entryPoints.values()).filter(count => count > 1).length;
        return returningSessions / entryPoints.size;
    }
    
    calculateAverageTimePerTopic(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        let totalTime = 0;
        let topicCount = 0;
        
        sessions.forEach(session => {
            if (session.pageViews) {
                session.pageViews.forEach(pageView => {
                    if (pageView.timeSpent) {
                        totalTime += pageView.timeSpent;
                        topicCount++;
                    }
                });
            }
        });
        
        return topicCount > 0 ? totalTime / topicCount / 1000 : 0; // 秒単位
    }
    
    calculateInteractionRate(sessions, interactions) {
        if (!sessions || sessions.length === 0) return 0;
        
        const interactionCount = interactions ? interactions.length : 0;
        return interactionCount / sessions.length;
    }
    
    calculateSearchSuccessRate(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        
        let totalSearches = 0;
        let successfulSearches = 0;
        
        sessions.forEach(session => {
            if (session.searchQueries) {
                session.searchQueries.forEach(query => {
                    totalSearches++;
                    if (query.resultCount > 0) {
                        successfulSearches++;
                    }
                });
            }
        });
        
        return totalSearches > 0 ? successfulSearches / totalSearches : 0;
    }
    
    calculateNavigationEfficiency(sessions) {
        // ナビゲーション効率の簡単な実装
        if (!sessions || sessions.length === 0) return 0;
        
        let totalNavigations = 0;
        let efficientNavigations = 0;
        
        sessions.forEach(session => {
            if (session.pageViews && session.pageViews.length > 1) {
                totalNavigations++;
                // 直帰率が低い場合を効率的とみなす
                if (session.pageViews.length >= 3) {
                    efficientNavigations++;
                }
            }
        });
        
        return totalNavigations > 0 ? efficientNavigations / totalNavigations : 0;
    }
    
    calculateContentCompletionRate(sessions) {
        // コンテンツ完了率の推定
        if (!sessions || sessions.length === 0) return 0;
        
        let completedSessions = 0;
        
        sessions.forEach(session => {
            if (session.duration && session.duration > 120000) { // 2分以上
                completedSessions++;
            }
        });
        
        return completedSessions / sessions.length;
    }
    
    calculateSentimentScore(interactions) {
        if (!interactions || interactions.length === 0) return 0.5;
        
        let positiveCount = 0;
        let totalCount = 0;
        
        interactions.forEach(([contentId, feedback]) => {
            if (feedback.helpful !== null) {
                totalCount++;
                if (feedback.helpful) {
                    positiveCount++;
                }
            }
        });
        
        return totalCount > 0 ? positiveCount / totalCount : 0.5;
    }
    
    // ========== 分析メソッド ==========
    
    analyzeSessionDistribution(sessions) {
        const distribution = {
            byDuration: { short: 0, medium: 0, long: 0 },
            byPageViews: { few: 0, moderate: 0, many: 0 },
            byTime: new Map()
        };
        
        sessions.forEach(session => {
            // 時間別分布
            if (session.duration) {
                if (session.duration < 60000) distribution.byDuration.short++;
                else if (session.duration < 300000) distribution.byDuration.medium++;
                else distribution.byDuration.long++;
            }
            
            // ページビュー分布
            const pageViews = session.pageViews ? session.pageViews.length : 0;
            if (pageViews < 3) distribution.byPageViews.few++;
            else if (pageViews < 7) distribution.byPageViews.moderate++;
            else distribution.byPageViews.many++;
        });
        
        return distribution;
    }
    
    analyzeUsagePatterns(sessions) {
        const patterns = {
            peakHours: new Map(),
            commonJourneys: new Map(),
            entryPoints: new Map()
        };
        
        sessions.forEach(session => {
            // エントリーポイント分析
            const entry = session.entryPoint || 'unknown';
            patterns.entryPoints.set(entry, (patterns.entryPoints.get(entry) || 0) + 1);
            
            // 時間帯分析
            if (session.startTime) {
                const hour = new Date(session.startTime).getHours();
                patterns.peakHours.set(hour, (patterns.peakHours.get(hour) || 0) + 1);
            }
        });
        
        return patterns;
    }
    
    generateUsageInsights(summary, details) {
        const insights = [];
        
        if (summary.averageSessionDuration < 60) {
            insights.push({
                type: 'usage_concern',
                message: 'セッション時間が短く、ユーザーが求める情報を見つけにくい可能性があります',
                severity: 'medium'
            });
        }
        
        if (summary.searchUsageRate > 0.6) {
            insights.push({
                type: 'usage_positive',
                message: '検索機能がよく利用されており、ユーザーの能動的な情報探索が見られます',
                severity: 'low'
            });
        }
        
        return insights;
    }
    
    // ========== スタブメソッド（詳細実装は必要に応じて） ==========
    
    analyzeTopicEngagement(sessions) { return {}; }
    analyzeSearchBehavior(sessions) { return {}; }
    analyzeNavigationPatterns(sessions) { return {}; }
    identifyDropoffPoints(sessions) { return []; }
    analyzePeakUsageTimes(sessions) { return {}; }
    generateEngagementInsights(summary, details) { return []; }
    identifyImprovementAreas(interactions) { return []; }
    analyzeUserSentiments(interactions) { return {}; }
    generateSatisfactionInsights(summary, details) { return []; }
    
    /**
     * メトリクス収集統計の取得
     * @returns {Object} 収集統計
     */
    getCollectionStats() {
        return {
            isActive: this.collectionState.isActive,
            lastCollectionTime: this.collectionState.lastCollectionTime,
            queueSize: this.collectionState.collectionQueue.length,
            config: { ...this.config }
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.collectionState.isActive = false;
        this.collectionState.collectionQueue = [];
        
        console.log('[HelpMetricsCollector] Component destroyed');
    }
}