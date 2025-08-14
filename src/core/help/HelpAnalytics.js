import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * ヘルプシステムの使用状況を追跡・分析するクラス
 */
export class HelpAnalytics {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 追跡対象イベント
        this.events = new Map();
        this.sessions = new Map();
        this.currentSession = null;
        
        // 設定
        this.config = {
            sessionTimeout: 30 * 60 * 1000, // 30分
            maxEvents: 1000,
            enableRealTimeTracking: true,
            enableOfflineStorage: true,
            dataRetentionDays: 30
        };
        
        // 追跡データ
        this.analytics = {
            helpUsage: {
                totalSessions: 0,
                totalPageViews: 0,
                uniqueUsers: new Set(),
                averageSessionDuration: 0,
                topHelpCategories: new Map(),
                topHelpTopics: new Map(),
                searchQueries: new Map(),
                exitPoints: new Map()
            },
            content: {
                topicViews: new Map(),
                categoryViews: new Map()
            },
            tutorialUsage: {
                totalStarts: 0,
                totalCompletions: 0,
                completionRate: 0,
                averageCompletionTime: 0,
                dropOffPoints: new Map(),
                skipRates: new Map(),
                retryRates: new Map()
            },
            userBehavior: {
                navigationPatterns: new Map(),
                timeSpentBySection: new Map(),
                commonUserJourneys: new Map(),
                bounceRate: 0,
                returnUserRate: 0
            },
            effectiveness: {
                helpfulnessRatings: new Map(),
                problemResolutionRate: 0,
                userSatisfactionScore: 0,
                contentGaps: new Map(),
                improvementSuggestions: []
            }
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // ローカルストレージからデータを復元
            this.loadAnalyticsData();
            
            // セッション管理の開始
            this.startSessionTracking();
            
            // 定期的なデータ保存
            this.setupPeriodicSave();
            
            // ページ離脱時の処理
            this.setupUnloadHandlers();
            
            this.loggingSystem.info('HelpAnalytics', 'Help analytics initialized');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to initialize help analytics', error);
            ErrorHandler.handle(error, 'HelpAnalytics.initialize');
        }
    }
    
    /**
     * ヘルプセッションの開始
     * @param {string} entryPoint - 入口ポイント
     * @param {Object} context - コンテキスト情報
     */
    startHelpSession(entryPoint, context = {}) {
        try {
            const sessionId = this.generateSessionId();
            const timestamp = Date.now();
            
            this.currentSession = {
                id: sessionId,
                startTime: timestamp,
                entryPoint: entryPoint,
                context: context,
                events: [],
                pageViews: [],
                searchQueries: [],
                currentPage: null,
                lastActivityTime: timestamp
            };
            
            this.sessions.set(sessionId, this.currentSession);
            this.analytics.helpUsage.totalSessions++;
            
            // エントリーポイントの追跡
            this.trackEvent('help_session_start', {
                sessionId: sessionId,
                entryPoint: entryPoint,
                context: context
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Help session started: ${sessionId} from ${entryPoint}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to start help session', error);
        }
    }
    
    /**
     * ヘルプセッションの終了
     * @param {string} exitPoint - 終了ポイント
     * @param {Object} exitContext - 終了コンテキスト
     */
    endHelpSession(exitPoint, exitContext = {}) {
        try {
            if (!this.currentSession) return;
            
            const endTime = Date.now();
            const duration = endTime - this.currentSession.startTime;
            
            // セッション情報の更新
            this.currentSession.endTime = endTime;
            this.currentSession.duration = duration;
            this.currentSession.exitPoint = exitPoint;
            this.currentSession.exitContext = exitContext;
            
            // 統計の更新
            this.updateSessionStatistics(this.currentSession);
            
            // 終了イベントの追跡
            this.trackEvent('help_session_end', {
                sessionId: this.currentSession.id,
                duration: duration,
                exitPoint: exitPoint,
                pageViews: this.currentSession.pageViews.length,
                searchCount: this.currentSession.searchQueries.length
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Help session ended: ${this.currentSession.id}, duration: ${duration}ms`);
            this.currentSession = null;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to end help session', error);
        }
    }
    
    /**
     * ページビューの追跡
     * @param {string} page - ページ名
     * @param {Object} pageData - ページデータ
     */
    trackPageView(page, pageData = {}) {
        try {
            const timestamp = Date.now();
            const pageView = {
                page: page,
                timestamp: timestamp,
                data: pageData,
                timeSpent: 0
            };
            
            if (this.currentSession) {
                // 前のページの滞在時間を計算
                if (this.currentSession.currentPage) {
                    const lastPageView = this.currentSession.pageViews[this.currentSession.pageViews.length - 1];
                    if (lastPageView) {
                        lastPageView.timeSpent = timestamp - lastPageView.timestamp;
                        this.updateTimeSpentStatistics(lastPageView.page, lastPageView.timeSpent);
                    }
                }
                
                this.currentSession.pageViews.push(pageView);
                this.currentSession.currentPage = page;
                this.currentSession.lastActivityTime = timestamp;
            }
            
            // 統計の更新
            this.analytics.helpUsage.totalPageViews++;
            this.updateCategoryStatistics(page);
            
            this.trackEvent('page_view', {
                page: page,
                data: pageData
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Page view tracked: ${page}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track page view', error);
        }
    }
    
    /**
     * 検索クエリの追跡
     * @param {string} query - 検索クエリ
     * @param {Array} results - 検索結果
     * @param {number} resultCount - 結果数
     */
    trackSearchQuery(query, results = [], resultCount = 0) {
        try {
            const timestamp = Date.now();
            const searchData = {
                query: query,
                timestamp: timestamp,
                resultCount: resultCount,
                results: results.map(r => ({ id: r.id, title: r.title, category: r.category }))
            };
            
            if (this.currentSession) {
                this.currentSession.searchQueries.push(searchData);
                this.currentSession.lastActivityTime = timestamp;
            }
            
            // 検索統計の更新
            const currentCount = this.analytics.helpUsage.searchQueries.get(query) || 0;
            this.analytics.helpUsage.searchQueries.set(query, currentCount + 1);
            
            this.trackEvent('search_query', {
                query: query,
                resultCount: resultCount,
                hasResults: resultCount > 0
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Search query tracked: "${query}" (${resultCount} results)`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track search query', error);
        }
    }
    
    /**
     * チュートリアル開始の追跡
     * @param {string} tutorialId - チュートリアルID
     * @param {Object} context - コンテキスト
     */
    trackTutorialStart(tutorialId, context = {}) {
        try {
            this.analytics.tutorialUsage.totalStarts++;
            
            this.trackEvent('tutorial_start', {
                tutorialId: tutorialId,
                context: context
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Tutorial start tracked: ${tutorialId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial start', error);
        }
    }
    
    /**
     * チュートリアル完了の追跡
     * @param {string} tutorialId - チュートリアルID
     * @param {number} completionTime - 完了時間
     * @param {number} stepsCompleted - 完了ステップ数
     */
    trackTutorialCompletion(tutorialId, completionTime, stepsCompleted) {
        try {
            this.analytics.tutorialUsage.totalCompletions++;
            this.updateTutorialStatistics(tutorialId, completionTime, stepsCompleted, true);
            
            this.trackEvent('tutorial_completion', {
                tutorialId: tutorialId,
                completionTime: completionTime,
                stepsCompleted: stepsCompleted
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Tutorial completion tracked: ${tutorialId} (${completionTime}ms)`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial completion', error);
        }
    }
    
    /**
     * チュートリアル離脱の追跡
     * @param {string} tutorialId - チュートリアルID
     * @param {number} stepIndex - 離脱ステップ
     * @param {string} reason - 離脱理由
     */
    trackTutorialDropOff(tutorialId, stepIndex, reason = '') {
        try {
            const dropOffKey = `${tutorialId}_step_${stepIndex}`;
            const currentCount = this.analytics.tutorialUsage.dropOffPoints.get(dropOffKey) || 0;
            this.analytics.tutorialUsage.dropOffPoints.set(dropOffKey, currentCount + 1);
            
            this.trackEvent('tutorial_drop_off', {
                tutorialId: tutorialId,
                stepIndex: stepIndex,
                reason: reason
            });
            
            this.loggingSystem.debug('HelpAnalytics', `Tutorial drop-off tracked: ${tutorialId} at step ${stepIndex}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial drop-off', error);
        }
    }
    
    /**
     * ユーザーフィードバックの追跡
     * @param {string} contentId - コンテンツID
     * @param {number} rating - 評価 (1-5)
     * @param {string} feedback - フィードバックテキスト
     * @param {Object} context - コンテキスト
     */
    trackUserFeedback(contentId, rating, feedback = '', context = {}) {
        try {
            const feedbackData = {
                contentId: contentId,
                rating: rating,
                feedback: feedback,
                context: context,
                timestamp: Date.now()
            };
            
            // 評価統計の更新
            if (!this.analytics.effectiveness.helpfulnessRatings.has(contentId)) {
                this.analytics.effectiveness.helpfulnessRatings.set(contentId, {
                    totalRatings: 0,
                    averageRating: 0,
                    ratingCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                });
            }
            
            const ratingData = this.analytics.effectiveness.helpfulnessRatings.get(contentId);
            ratingData.totalRatings++;
            ratingData.ratingCount[rating]++;
            
            // 平均評価の再計算
            let totalScore = 0;
            for (let i = 1; i <= 5; i++) {
                totalScore += i * ratingData.ratingCount[i];
            }
            ratingData.averageRating = totalScore / ratingData.totalRatings;
            
            this.trackEvent('user_feedback', feedbackData);
            
            this.loggingSystem.debug('HelpAnalytics', `User feedback tracked: ${contentId} (rating: ${rating})`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track user feedback', error);
        }
    }

    /**
     * カテゴリ選択を記録
     * @param {string} categoryId - 選択されたカテゴリのID
     * @param {Object} context - 選択時のコンテキスト情報
     */
    recordCategorySelection(categoryId, context = {}) {
        try {
            const selectionData = {
                categoryId: categoryId,
                context: context,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // カテゴリ統計の更新
            this.updateCategoryStatistics(categoryId);
            
            // イベント記録
            this.trackEvent('category_selection', selectionData);
            
            this.loggingSystem.debug('HelpAnalytics', `Category selection tracked: ${categoryId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record category selection', error);
        }
    }

    /**
     * トピック終了を記録
     * @param {string} topicId - 終了したトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} exitContext - 終了時のコンテキスト情報
     */
    recordTopicExit(topicId, content, exitContext = {}) {
        try {
            const exitData = {
                topicId: topicId,
                content: content,
                exitContext: exitContext,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // トピック統計の更新
            if (!this.analytics.content.topicViews.has(topicId)) {
                this.analytics.content.topicViews.set(topicId, {
                    viewCount: 0,
                    totalViewTime: 0,
                    exitCount: 0
                });
            }
            
            const topicStats = this.analytics.content.topicViews.get(topicId);
            topicStats.exitCount++;
            
            // イベント記録
            this.trackEvent('topic_exit', exitData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic exit tracked: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record topic exit', error);
        }
    }

    /**
     * トピック表示を記録
     * @param {string} topicId - 表示されたトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} viewContext - 表示時のコンテキスト情報
     */
    recordTopicView(topicId, content, viewContext = {}) {
        try {
            const viewData = {
                topicId: topicId,
                content: content,
                viewContext: viewContext,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // トピック統計の更新
            if (!this.analytics.content.topicViews.has(topicId)) {
                this.analytics.content.topicViews.set(topicId, {
                    viewCount: 0,
                    totalViewTime: 0,
                    exitCount: 0
                });
            }
            
            const topicStats = this.analytics.content.topicViews.get(topicId);
            topicStats.viewCount++;
            
            // イベント記録
            this.trackEvent('topic_view', viewData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic view tracked: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record topic view', error);
        }
    }

    /**
     * フィードバックを記録
     * @param {string} topicId - フィードバック対象のトピックID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} feedback - フィードバック内容
     */
    recordFeedback(topicId, content, feedback) {
        try {
            const feedbackData = {
                topicId: topicId,
                content: content,
                feedback: feedback,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // フィードバック統計の更新
            if (feedback.rating) {
                this.trackUserFeedback(topicId, feedback.rating, feedback.comment || '', {
                    content: content
                });
            }
            
            // イベント記録
            this.trackEvent('topic_feedback', feedbackData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic feedback tracked: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record topic feedback', error);
        }
    }
    
    /**
     * イベントの追跡
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    trackEvent(eventType, eventData = {}) {
        try {
            const event = {
                type: eventType,
                data: eventData,
                timestamp: Date.now(),
                sessionId: this.currentSession ? this.currentSession.id : null
            };
            
            // イベントキューに追加
            const eventId = this.generateEventId();
            this.events.set(eventId, event);
            
            // セッションにも追加
            if (this.currentSession) {
                this.currentSession.events.push(event);
                this.currentSession.lastActivityTime = event.timestamp;
            }
            
            // イベント数制限のチェック
            if (this.events.size > this.config.maxEvents) {
                this.cleanupOldEvents();
            }
            
            // リアルタイム処理（必要に応じて）
            if (this.config.enableRealTimeTracking) {
                this.processEventRealTime(event);
            }
            
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track event', error);
        }
    }
    
    /**
     * 分析レポートの生成
     * @param {string} reportType - レポートタイプ
     * @param {Object} options - オプション
     * @returns {Object} 分析レポート
     */
    generateReport(reportType = 'summary', options = {}) {
        try {
            const report = {
                generatedAt: Date.now(),
                reportType: reportType,
                period: options.period || 'all',
                data: {}
            };
            
            switch (reportType) {
                case 'summary':
                    report.data = this.generateSummaryReport(options);
                    break;
                case 'detailed':
                    report.data = this.generateDetailedReport(options);
                    break;
                case 'user_journey':
                    report.data = this.generateUserJourneyReport(options);
                    break;
                case 'effectiveness':
                    report.data = this.generateEffectivenessReport(options);
                    break;
                case 'tutorial_analysis':
                    report.data = this.generateTutorialAnalysisReport(options);
                    break;
                default:
                    report.data = this.analytics;
            }
            
            this.loggingSystem.debug('HelpAnalytics', `Report generated: ${reportType}`);
            return report;
            
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to generate report', error);
            return { error: error.message };
        }
    }
    
    /**
     * サマリーレポートの生成
     * @param {Object} options - オプション
     * @returns {Object} サマリーレポート
     */
    generateSummaryReport(options = {}) {
        const completionRate = this.analytics.tutorialUsage.totalStarts > 0 ?
            (this.analytics.tutorialUsage.totalCompletions / this.analytics.tutorialUsage.totalStarts) * 100 : 0;
        
        return {
            overview: {
                totalHelpSessions: this.analytics.helpUsage.totalSessions,
                totalPageViews: this.analytics.helpUsage.totalPageViews,
                uniqueUsers: this.analytics.helpUsage.uniqueUsers.size,
                averageSessionDuration: this.calculateAverageSessionDuration(),
                tutorialCompletionRate: Math.round(completionRate * 100) / 100
            },
            topContent: {
                categories: this.getTopCategories(5),
                topics: this.getTopTopics(10),
                searchQueries: this.getTopSearchQueries(10)
            },
            userSatisfaction: {
                averageRating: this.calculateAverageRating(),
                totalFeedbacks: this.getTotalFeedbackCount(),
                satisfactionScore: this.calculateSatisfactionScore()
            }
        };
    }
    
    /**
     * 効果測定レポートの生成
     * @param {Object} options - オプション
     * @returns {Object} 効果測定レポート
     */
    generateEffectivenessReport(options = {}) {
        return {
            contentPerformance: this.analyzeContentPerformance(),
            userBehavior: this.analyzeUserBehavior(),
            problemAreas: this.identifyProblemAreas(),
            improvements: this.generateImprovementSuggestions()
        };
    }
    
    /**
     * データの保存
     */
    saveAnalyticsData() {
        try {
            if (!this.config.enableOfflineStorage) return;
            
            const dataToSave = {
                analytics: this.analytics,
                sessions: Array.from(this.sessions.entries()),
                events: Array.from(this.events.entries()).slice(-100), // 最新100件のみ
                lastSaved: Date.now()
            };
            
            localStorage.setItem('help_analytics_data', JSON.stringify(dataToSave));
            this.loggingSystem.debug('HelpAnalytics', 'Analytics data saved to localStorage');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to save analytics data', error);
        }
    }
    
    /**
     * データの読み込み
     */
    loadAnalyticsData() {
        try {
            if (!this.config.enableOfflineStorage) return;
            
            const savedData = localStorage.getItem('help_analytics_data');
            if (!savedData) return;
            
            const data = JSON.parse(savedData);
            
            // データの復元
            if (data.analytics) {
                // Mapオブジェクトの復元
                Object.keys(data.analytics).forEach(category => {
                    const categoryData = data.analytics[category];
                    Object.keys(categoryData).forEach(key => {
                        if (categoryData[key] && typeof categoryData[key] === 'object' && categoryData[key]._isMap) {
                            categoryData[key] = new Map(categoryData[key].entries);
                        }
                    });
                });
                
                this.analytics = { ...this.analytics, ...data.analytics };
            }
            
            if (data.sessions) {
                this.sessions = new Map(data.sessions);
            }
            
            if (data.events) {
                this.events = new Map(data.events);
            }
            
            this.loggingSystem.debug('HelpAnalytics', 'Analytics data loaded from localStorage');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to load analytics data', error);
        }
    }
    
    /**
     * ユーティリティメソッド群
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateEventId() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateSessionStatistics(session) {
        // セッション統計の更新ロジック
        const duration = session.duration || 0;
        const currentAvg = this.analytics.helpUsage.averageSessionDuration;
        const totalSessions = this.analytics.helpUsage.totalSessions;
        
        this.analytics.helpUsage.averageSessionDuration = 
            (currentAvg * (totalSessions - 1) + duration) / totalSessions;
    }
    
    calculateAverageSessionDuration() {
        return Math.round(this.analytics.helpUsage.averageSessionDuration / 1000); // 秒単位
    }
    
    getTopCategories(limit = 5) {
        return Array.from(this.analytics.helpUsage.topHelpCategories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([category, count]) => ({ category, count }));
    }
    
    getTopTopics(limit = 10) {
        return Array.from(this.analytics.helpUsage.topHelpTopics.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([topic, count]) => ({ topic, count }));
    }
    
    getTopSearchQueries(limit = 10) {
        return Array.from(this.analytics.helpUsage.searchQueries.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
    }
    
    setupPeriodicSave() {
        setInterval(() => {
            this.saveAnalyticsData();
        }, 60000); // 1分間隔
    }
    
    setupUnloadHandlers() {
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.endHelpSession('page_unload');
            }
            this.saveAnalyticsData();
        });
    }
    
    startSessionTracking() {
        // セッションタイムアウトのチェック
        setInterval(() => {
            if (this.currentSession) {
                const now = Date.now();
                const inactive = now - this.currentSession.lastActivityTime;
                
                if (inactive > this.config.sessionTimeout) {
                    this.endHelpSession('timeout');
                }
            }
        }, 60000); // 1分間隔でチェック
    }
    
    cleanupOldEvents() {
        const cutoffTime = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
        const eventsToDelete = [];
        
        for (const [eventId, event] of this.events.entries()) {
            if (event.timestamp < cutoffTime) {
                eventsToDelete.push(eventId);
            }
        }
        
        eventsToDelete.forEach(eventId => this.events.delete(eventId));
    }
    
    processEventRealTime(event) {
        // リアルタイム処理（必要に応じて拡張）
        if (event.type === 'search_query' && event.data.resultCount === 0) {
            // 検索結果が0件の場合は改善の余地ありとして記録
            const query = event.data.query;
            const gaps = this.analytics.effectiveness.contentGaps;
            gaps.set(query, (gaps.get(query) || 0) + 1);
        }
    }
    
    updateCategoryStatistics(page) {
        // ページからカテゴリを推定して統計を更新
        const categories = this.analytics.helpUsage.topHelpCategories;
        categories.set(page, (categories.get(page) || 0) + 1);
    }
    
    updateTimeSpentStatistics(page, timeSpent) {
        const timeStats = this.analytics.userBehavior.timeSpentBySection;
        if (!timeStats.has(page)) {
            timeStats.set(page, { total: 0, count: 0, average: 0 });
        }
        
        const stats = timeStats.get(page);
        stats.total += timeSpent;
        stats.count++;
        stats.average = stats.total / stats.count;
    }
    
    updateTutorialStatistics(tutorialId, completionTime, stepsCompleted, completed) {
        if (completed) {
            // 完了時間の平均を更新
            const currentAvg = this.analytics.tutorialUsage.averageCompletionTime;
            const totalCompletions = this.analytics.tutorialUsage.totalCompletions;
            
            this.analytics.tutorialUsage.averageCompletionTime = 
                (currentAvg * (totalCompletions - 1) + completionTime) / totalCompletions;
                
            // 完了率の更新
            this.analytics.tutorialUsage.completionRate = 
                (this.analytics.tutorialUsage.totalCompletions / this.analytics.tutorialUsage.totalStarts) * 100;
        }
    }
    
    calculateAverageRating() {
        let totalRating = 0;
        let totalCount = 0;
        
        for (const [contentId, ratingData] of this.analytics.effectiveness.helpfulnessRatings.entries()) {
            totalRating += ratingData.averageRating * ratingData.totalRatings;
            totalCount += ratingData.totalRatings;
        }
        
        return totalCount > 0 ? totalRating / totalCount : 0;
    }
    
    getTotalFeedbackCount() {
        let totalCount = 0;
        for (const [contentId, ratingData] of this.analytics.effectiveness.helpfulnessRatings.entries()) {
            totalCount += ratingData.totalRatings;
        }
        return totalCount;
    }
    
    calculateSatisfactionScore() {
        const avgRating = this.calculateAverageRating();
        return Math.round((avgRating / 5) * 100); // 100点満点に換算
    }
    
    analyzeContentPerformance() {
        // コンテンツのパフォーマンス分析
        const performance = {};
        
        for (const [contentId, ratingData] of this.analytics.effectiveness.helpfulnessRatings.entries()) {
            performance[contentId] = {
                averageRating: ratingData.averageRating,
                totalRatings: ratingData.totalRatings,
                helpfulness: ratingData.averageRating >= 4 ? 'high' : ratingData.averageRating >= 3 ? 'medium' : 'low'
            };
        }
        
        return performance;
    }
    
    analyzeUserBehavior() {
        // ユーザー行動の分析
        return {
            timeSpentBySection: Object.fromEntries(this.analytics.userBehavior.timeSpentBySection),
            navigationPatterns: Object.fromEntries(this.analytics.userBehavior.navigationPatterns),
            commonJourneys: Object.fromEntries(this.analytics.userBehavior.commonUserJourneys)
        };
    }
    
    identifyProblemAreas() {
        // 問題のある領域の特定
        const problems = [];
        
        // 低評価のコンテンツ
        for (const [contentId, ratingData] of this.analytics.effectiveness.helpfulnessRatings.entries()) {
            if (ratingData.averageRating < 3 && ratingData.totalRatings >= 5) {
                problems.push({
                    type: 'low_rating',
                    contentId: contentId,
                    rating: ratingData.averageRating,
                    severity: 'high'
                });
            }
        }
        
        // 検索結果が見つからないクエリ
        for (const [query, count] of this.analytics.effectiveness.contentGaps.entries()) {
            if (count >= 3) {
                problems.push({
                    type: 'content_gap',
                    query: query,
                    searchCount: count,
                    severity: 'medium'
                });
            }
        }
        
        return problems;
    }
    
    generateImprovementSuggestions() {
        // 改善提案の生成
        const suggestions = [];
        const problems = this.identifyProblemAreas();
        
        problems.forEach(problem => {
            if (problem.type === 'low_rating') {
                suggestions.push({
                    type: 'content_improvement',
                    contentId: problem.contentId,
                    suggestion: `コンテンツ "${problem.contentId}" の品質改善が必要です（評価: ${problem.rating.toFixed(1)}）`,
                    priority: 'high'
                });
            }
            
            if (problem.type === 'content_gap') {
                suggestions.push({
                    type: 'content_creation',
                    query: problem.query,
                    suggestion: `"${problem.query}" に関するヘルプコンテンツの作成を検討してください`,
                    priority: 'medium'
                });
            }
        });
        
        return suggestions;
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        try {
            if (this.currentSession) {
                this.endHelpSession('cleanup');
            }
            
            this.saveAnalyticsData();
            this.loggingSystem.info('HelpAnalytics', 'Help analytics cleaned up');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to cleanup help analytics', error);
        }
    }
}

// シングルトンインスタンス管理
let helpAnalyticsInstance = null;

/**
 * HelpAnalyticsのシングルトンインスタンスを取得
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpAnalytics} HelpAnalyticsインスタンス
 */
export function getHelpAnalytics(gameEngine) {
    if (!helpAnalyticsInstance && gameEngine) {
        helpAnalyticsInstance = new HelpAnalytics(gameEngine);
    }
    return helpAnalyticsInstance;
}

/**
 * HelpAnalyticsインスタンスを再初期化
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpAnalytics} 新しいHelpAnalyticsインスタンス
 */
export function reinitializeHelpAnalytics(gameEngine) {
    if (helpAnalyticsInstance) {
        helpAnalyticsInstance.cleanup();
    }
    helpAnalyticsInstance = gameEngine ? new HelpAnalytics(gameEngine) : null;
    return helpAnalyticsInstance;
}