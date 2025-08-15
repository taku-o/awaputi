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
            
            // Mapオブジェクトの確実な初期化（復元データが壊れている場合の対策）
            this.ensureMapInitialization();
            
            // コンテンツキャッシングの初期化
            this.initializeContentCaching();
            
            // パフォーマンス監視の初期化
            this.initializePerformanceMonitoring();
            
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
     * Mapオブジェクトの確実な初期化
     */
    ensureMapInitialization() {
        try {
            // helpUsageセクション
            if (!(this.analytics.helpUsage.topHelpCategories instanceof Map)) {
                this.analytics.helpUsage.topHelpCategories = new Map();
            }
            if (!(this.analytics.helpUsage.topHelpTopics instanceof Map)) {
                this.analytics.helpUsage.topHelpTopics = new Map();
            }
            if (!(this.analytics.helpUsage.searchQueries instanceof Map)) {
                this.analytics.helpUsage.searchQueries = new Map();
            }
            if (!(this.analytics.helpUsage.exitPoints instanceof Map)) {
                this.analytics.helpUsage.exitPoints = new Map();
            }
            
            // contentセクション
            if (!this.analytics.content || typeof this.analytics.content !== 'object') {
                this.analytics.content = {};
            }
            if (!(this.analytics.content.topicViews instanceof Map)) {
                this.analytics.content.topicViews = new Map();
            }
            if (!(this.analytics.content.categoryViews instanceof Map)) {
                this.analytics.content.categoryViews = new Map();
            }
            
            // 他の必要なMapオブジェクト
            if (!(this.analytics.tutorialUsage.dropOffPoints instanceof Map)) {
                this.analytics.tutorialUsage.dropOffPoints = new Map();
            }
            if (!(this.analytics.tutorialUsage.skipRates instanceof Map)) {
                this.analytics.tutorialUsage.skipRates = new Map();
            }
            if (!(this.analytics.tutorialUsage.retryRates instanceof Map)) {
                this.analytics.tutorialUsage.retryRates = new Map();
            }
            
            if (!(this.analytics.userBehavior.navigationPatterns instanceof Map)) {
                this.analytics.userBehavior.navigationPatterns = new Map();
            }
            if (!(this.analytics.userBehavior.timeSpentBySection instanceof Map)) {
                this.analytics.userBehavior.timeSpentBySection = new Map();
            }
            if (!(this.analytics.userBehavior.commonUserJourneys instanceof Map)) {
                this.analytics.userBehavior.commonUserJourneys = new Map();
            }
            
            if (!(this.analytics.effectiveness.helpfulnessRatings instanceof Map)) {
                this.analytics.effectiveness.helpfulnessRatings = new Map();
            }
            if (!(this.analytics.effectiveness.contentGaps instanceof Map)) {
                this.analytics.effectiveness.contentGaps = new Map();
            }
            
            this.loggingSystem.debug('HelpAnalytics', 'Map initialization completed');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to ensure map initialization', error);
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
        return this.executeWithValidation('recordCategorySelection', () => {
            // データの検証とサニタイゼーション
            const categoryValidation = this.validateAndSanitizeData(categoryId, 'categoryId');
            const contextValidation = this.validateAndSanitizeData(context, 'context');

            if (!categoryValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid category ID for recording', categoryValidation.errors);
                return;
            }

            const sanitizedCategoryId = categoryValidation.sanitizedData;
            const sanitizedContext = contextValidation.sanitizedData;

            const selectionData = {
                categoryId: sanitizedCategoryId,
                context: sanitizedContext,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // カテゴリ統計の更新
            this.updateCategoryStatistics(sanitizedCategoryId);
            
            // イベント記録
            this.trackEvent('category_selection', selectionData);
            
            this.loggingSystem.debug('HelpAnalytics', `Category selection tracked: ${sanitizedCategoryId}`);
        });
    }

    /**
     * トピック終了を記録
     * @param {string} topicId - 終了したトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} exitContext - 終了時のコンテキスト情報
     */
    recordTopicExit(topicId, content, exitContext = {}) {
        return this.executeWithValidation('recordTopicExit', () => {
            // データの検証とサニタイゼーション
            const topicValidation = this.validateAndSanitizeData(topicId, 'topicId');
            const contextValidation = this.validateAndSanitizeData(exitContext, 'context');

            if (!topicValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid topic ID for recording exit', topicValidation.errors);
                return;
            }

            const sanitizedTopicId = topicValidation.sanitizedData;
            const sanitizedContext = contextValidation.sanitizedData;

            // コンテンツの基本サニタイゼーション
            const sanitizedContent = typeof content === 'object' && content !== null ? 
                this.sanitizeObject(content) : {};

            const exitData = {
                topicId: sanitizedTopicId,
                content: sanitizedContent,
                exitContext: sanitizedContext,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // トピック統計の更新
            if (!this.analytics.content.topicViews.has(sanitizedTopicId)) {
                this.analytics.content.topicViews.set(sanitizedTopicId, {
                    viewCount: 0,
                    totalViewTime: 0,
                    exitCount: 0
                });
            }
            
            const topicStats = this.analytics.content.topicViews.get(sanitizedTopicId);
            topicStats.exitCount++;
            
            // イベント記録
            this.trackEvent('topic_exit', exitData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic exit tracked: ${sanitizedTopicId}`);
        });
    }

    /**
     * トピック表示を記録
     * @param {string} topicId - 表示されたトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} viewContext - 表示時のコンテキスト情報
     */
    recordTopicView(topicId, content, viewContext = {}) {
        return this.executeWithValidation('recordTopicView', () => {
            // データの検証とサニタイゼーション
            const topicValidation = this.validateAndSanitizeData(topicId, 'topicId');
            const contextValidation = this.validateAndSanitizeData(viewContext, 'context');

            if (!topicValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid topic ID for recording view', topicValidation.errors);
                return;
            }

            const sanitizedTopicId = topicValidation.sanitizedData;
            const sanitizedContext = contextValidation.sanitizedData;

            // コンテンツの基本サニタイゼーション
            const sanitizedContent = typeof content === 'object' && content !== null ? 
                this.sanitizeObject(content) : {};

            const viewData = {
                topicId: sanitizedTopicId,
                content: sanitizedContent,
                viewContext: sanitizedContext,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // トピック統計の更新
            if (!this.analytics.content.topicViews.has(sanitizedTopicId)) {
                this.analytics.content.topicViews.set(sanitizedTopicId, {
                    viewCount: 0,
                    totalViewTime: 0,
                    exitCount: 0
                });
            }
            
            const topicStats = this.analytics.content.topicViews.get(sanitizedTopicId);
            topicStats.viewCount++;
            
            // イベント記録
            this.trackEvent('topic_view', viewData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic view tracked: ${sanitizedTopicId}`);
        });
    }

    /**
     * フィードバックを記録
     * @param {string} topicId - フィードバック対象のトピックID
     * @param {Object} content - トピックのコンテンツ情報
     * @param {Object} feedback - フィードバック内容
     */
    recordFeedback(topicId, content, feedback) {
        return this.executeWithValidation('recordFeedback', () => {
            // データの検証とサニタイゼーション
            const topicValidation = this.validateAndSanitizeData(topicId, 'topicId');
            const feedbackValidation = this.validateAndSanitizeData(feedback, 'feedback');

            if (!topicValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid topic ID for recording feedback', topicValidation.errors);
                return;
            }

            if (!feedbackValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid feedback data', feedbackValidation.errors);
                return;
            }

            const sanitizedTopicId = topicValidation.sanitizedData;
            const sanitizedFeedback = feedbackValidation.sanitizedData;

            // コンテンツの基本サニタイゼーション
            const sanitizedContent = typeof content === 'object' && content !== null ? 
                this.sanitizeObject(content) : {};

            const feedbackData = {
                topicId: sanitizedTopicId,
                content: sanitizedContent,
                feedback: sanitizedFeedback,
                timestamp: Date.now(),
                sessionId: this.currentSession?.id || 'unknown'
            };
            
            // フィードバック統計の更新
            if (sanitizedFeedback.rating) {
                this.trackUserFeedback(sanitizedTopicId, sanitizedFeedback.rating, sanitizedFeedback.comment || '', {
                    content: sanitizedContent
                });
            }
            
            // イベント記録
            this.trackEvent('topic_feedback', feedbackData);
            
            this.loggingSystem.debug('HelpAnalytics', `Topic feedback tracked: ${sanitizedTopicId}`);
        });
    }

    /**
     * 検索クエリを記録
     * @param {string} query - 検索クエリ
     * @param {number} resultCount - 検索結果数
     */
    recordSearchQuery(query, resultCount = 0) {
        return this.executeWithValidation('recordSearchQuery', () => {
            // データの検証とサニタイゼーション
            const queryValidation = this.validateAndSanitizeData(query, 'searchQuery');

            if (!queryValidation.isValid) {
                this.loggingSystem.error('HelpAnalytics', 'Invalid search query', queryValidation.errors);
                return;
            }

            const sanitizedQuery = queryValidation.sanitizedData;
            
            // 結果数の検証
            const sanitizedResultCount = typeof resultCount === 'number' && isFinite(resultCount) && resultCount >= 0 ? 
                Math.floor(resultCount) : 0;

            // 既存のtrackSearchQueryメソッドを内部的に呼び出し
            this.trackSearchQuery(sanitizedQuery, [], sanitizedResultCount);
            
            this.loggingSystem.debug('HelpAnalytics', `Search query recorded: "${sanitizedQuery}" (${sanitizedResultCount} results)`);
        });
    }

    /**
     * 入力データの検証とサニタイゼーション
     * @param {*} data - 検証対象のデータ
     * @param {string} type - データタイプ
     * @returns {Object} 検証とサニタイゼーション結果
     */
    validateAndSanitizeData(data, type) {
        try {
            const result = {
                isValid: true,
                sanitizedData: null,
                errors: []
            };

            switch (type) {
                case 'categoryId':
                    result.sanitizedData = this.sanitizeString(data, { maxLength: 100, allowSpecialChars: false });
                    if (!result.sanitizedData || result.sanitizedData.length === 0) {
                        result.isValid = false;
                        result.errors.push('Invalid category ID');
                    }
                    break;

                case 'topicId':
                    result.sanitizedData = this.sanitizeString(data, { maxLength: 100, allowSpecialChars: false });
                    if (!result.sanitizedData || result.sanitizedData.length === 0) {
                        result.isValid = false;
                        result.errors.push('Invalid topic ID');
                    }
                    break;

                case 'searchQuery':
                    result.sanitizedData = this.sanitizeString(data, { maxLength: 200, preserveWhitespace: true });
                    // 検索クエリは空でも有効
                    break;

                case 'feedback':
                    if (typeof data === 'object' && data !== null) {
                        result.sanitizedData = {
                            rating: this.validateRating(data.rating),
                            comment: this.sanitizeString(data.comment || '', { maxLength: 1000, preserveWhitespace: true }),
                            timestamp: Date.now()
                        };
                        if (result.sanitizedData.rating === null) {
                            result.isValid = false;
                            result.errors.push('Invalid rating value');
                        }
                    } else {
                        result.isValid = false;
                        result.errors.push('Feedback must be an object');
                    }
                    break;

                case 'context':
                    if (typeof data === 'object' && data !== null) {
                        result.sanitizedData = this.sanitizeObject(data);
                    } else {
                        result.sanitizedData = {};
                    }
                    break;

                default:
                    result.isValid = false;
                    result.errors.push(`Unknown data type: ${type}`);
            }

            if (!result.isValid) {
                this.loggingSystem.warn('HelpAnalytics', `Data validation failed for ${type}:`, result.errors);
            }

            return result;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to validate and sanitize data', error);
            return {
                isValid: false,
                sanitizedData: null,
                errors: [error.message]
            };
        }
    }

    /**
     * 文字列のサニタイゼーション
     * @param {*} input - 入力文字列
     * @param {Object} options - サニタイゼーションオプション
     * @returns {string} サニタイズされた文字列
     */
    sanitizeString(input, options = {}) {
        try {
            if (typeof input !== 'string') {
                input = String(input);
            }

            let sanitized = input;

            // HTML/スクリプトタグの除去
            sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            sanitized = sanitized.replace(/<[^>]*>/g, '');

            // 危険な文字の置換
            sanitized = sanitized.replace(/[<>]/g, '');
            sanitized = sanitized.replace(/javascript:/gi, '');
            sanitized = sanitized.replace(/data:/gi, '');

            // 特殊文字の制限
            if (!options.allowSpecialChars) {
                sanitized = sanitized.replace(/[^\w\s\-_.]/g, '');
            }

            // 空白の処理
            if (!options.preserveWhitespace) {
                sanitized = sanitized.trim().replace(/\s+/g, ' ');
            }

            // 長さ制限
            if (options.maxLength && sanitized.length > options.maxLength) {
                sanitized = sanitized.substring(0, options.maxLength);
            }

            return sanitized;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to sanitize string', error);
            return '';
        }
    }

    /**
     * オブジェクトのサニタイゼーション
     * @param {Object} obj - 入力オブジェクト
     * @param {number} maxDepth - 最大深度
     * @returns {Object} サニタイズされたオブジェクト
     */
    sanitizeObject(obj, maxDepth = 3) {
        try {
            if (maxDepth <= 0 || typeof obj !== 'object' || obj === null) {
                return {};
            }

            const sanitized = {};
            const allowedKeys = ['sessionId', 'timestamp', 'source', 'target', 'type', 'data'];

            for (const [key, value] of Object.entries(obj)) {
                // キーの検証
                const sanitizedKey = this.sanitizeString(key, { maxLength: 50, allowSpecialChars: false });
                if (!sanitizedKey || !allowedKeys.includes(sanitizedKey)) {
                    continue;
                }

                // 値の処理
                if (typeof value === 'string') {
                    sanitized[sanitizedKey] = this.sanitizeString(value, { maxLength: 500, preserveWhitespace: true });
                } else if (typeof value === 'number' && isFinite(value)) {
                    sanitized[sanitizedKey] = value;
                } else if (typeof value === 'boolean') {
                    sanitized[sanitizedKey] = value;
                } else if (typeof value === 'object' && value !== null) {
                    sanitized[sanitizedKey] = this.sanitizeObject(value, maxDepth - 1);
                }
            }

            return sanitized;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to sanitize object', error);
            return {};
        }
    }

    /**
     * 評価値の検証
     * @param {*} rating - 評価値
     * @returns {number|null} 有効な評価値またはnull
     */
    validateRating(rating) {
        try {
            const numRating = Number(rating);
            if (isNaN(numRating) || numRating < 1 || numRating > 5) {
                return null;
            }
            return Math.round(numRating);
        } catch (error) {
            return null;
        }
    }

    /**
     * アナリティクスデータ構造の検証
     * @param {Object} data - 検証対象データ
     * @returns {boolean} 構造が有効かどうか
     */
    validateAnalyticsStructure(data) {
        try {
            const requiredSections = ['helpUsage', 'content', 'tutorialUsage', 'userBehavior', 'effectiveness'];
            
            for (const section of requiredSections) {
                if (!data[section] || typeof data[section] !== 'object') {
                    this.loggingSystem.error('HelpAnalytics', `Missing or invalid section: ${section}`);
                    return false;
                }
            }

            // Map オブジェクトの検証
            const mapFields = [
                'helpUsage.topHelpCategories',
                'helpUsage.topHelpTopics',
                'helpUsage.searchQueries',
                'content.topicViews',
                'content.categoryViews'
            ];

            for (const field of mapFields) {
                const fieldValue = this.getNestedValue(data, field);
                if (!(fieldValue instanceof Map)) {
                    this.loggingSystem.warn('HelpAnalytics', `Field ${field} is not a Map object`);
                }
            }

            return true;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to validate analytics structure', error);
            return false;
        }
    }

    /**
     * ネストされた値の取得
     * @param {Object} obj - オブジェクト
     * @param {string} path - ドット記法のパス
     * @returns {*} 値
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * エラーハンドリング付きデータ保存
     * @param {string} operation - 操作名
     * @param {function} dataOperation - データ操作関数
     */
    executeWithValidation(operation, dataOperation) {
        try {
            // データ構造の事前検証
            if (!this.validateAnalyticsStructure(this.analytics)) {
                this.ensureMapInitialization();
            }

            // 操作の実行
            const result = dataOperation();

            // 操作後の検証
            if (!this.validateAnalyticsStructure(this.analytics)) {
                this.loggingSystem.error('HelpAnalytics', `Data corruption detected after ${operation}`);
                this.ensureMapInitialization();
            }

            return result;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', `Failed to execute ${operation} with validation`, error);
            ErrorHandler.handle(error, `HelpAnalytics.${operation}`);
            throw error;
        }
    }

    /**
     * ヘルプコンテンツキャッシング機能
     */
    initializeContentCaching() {
        try {
            this.contentCache = new Map();
            this.searchCache = new Map();
            this.cacheConfig = {
                maxContentCacheSize: 50,
                maxSearchCacheSize: 100,
                cacheExpiryTime: 15 * 60 * 1000, // 15分
                enableCompression: true
            };

            // キャッシュクリーンアップ
            setInterval(() => {
                this.cleanupExpiredCache();
            }, 5 * 60 * 1000); // 5分間隔

            this.loggingSystem.debug('HelpAnalytics', 'Content caching initialized');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to initialize content caching', error);
        }
    }

    /**
     * コンテンツのキャッシュ
     * @param {string} contentId - コンテンツID
     * @param {Object} content - コンテンツデータ
     */
    cacheContent(contentId, content) {
        try {
            if (!this.contentCache) {
                this.initializeContentCaching();
            }

            const cacheEntry = {
                data: this.cacheConfig.enableCompression ? this.compressData(content) : content,
                timestamp: Date.now(),
                accessCount: 0,
                compressed: this.cacheConfig.enableCompression
            };

            // キャッシュサイズ制限
            if (this.contentCache.size >= this.cacheConfig.maxContentCacheSize) {
                this.evictLeastUsedContent();
            }

            this.contentCache.set(contentId, cacheEntry);
            this.loggingSystem.debug('HelpAnalytics', `Content cached: ${contentId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to cache content', error);
        }
    }

    /**
     * キャッシュからコンテンツを取得
     * @param {string} contentId - コンテンツID
     * @returns {Object|null} キャッシュされたコンテンツ
     */
    getCachedContent(contentId) {
        try {
            if (!this.contentCache || !this.contentCache.has(contentId)) {
                return null;
            }

            const cacheEntry = this.contentCache.get(contentId);
            
            // 有効期限チェック
            if (Date.now() - cacheEntry.timestamp > this.cacheConfig.cacheExpiryTime) {
                this.contentCache.delete(contentId);
                return null;
            }

            // アクセス統計の更新
            cacheEntry.accessCount++;
            
            // データの展開
            const content = cacheEntry.compressed ? 
                this.decompressData(cacheEntry.data) : cacheEntry.data;

            this.loggingSystem.debug('HelpAnalytics', `Content retrieved from cache: ${contentId}`);
            return content;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to get cached content', error);
            return null;
        }
    }

    /**
     * 検索結果のキャッシュ
     * @param {string} query - 検索クエリ
     * @param {Array} results - 検索結果
     */
    cacheSearchResults(query, results) {
        try {
            if (!this.searchCache) {
                this.initializeContentCaching();
            }

            const cacheKey = this.generateSearchCacheKey(query);
            const cacheEntry = {
                data: this.cacheConfig.enableCompression ? this.compressData(results) : results,
                timestamp: Date.now(),
                accessCount: 0,
                compressed: this.cacheConfig.enableCompression
            };

            // キャッシュサイズ制限
            if (this.searchCache.size >= this.cacheConfig.maxSearchCacheSize) {
                this.evictLeastUsedSearchResults();
            }

            this.searchCache.set(cacheKey, cacheEntry);
            this.loggingSystem.debug('HelpAnalytics', `Search results cached: "${query}"`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to cache search results', error);
        }
    }

    /**
     * キャッシュから検索結果を取得
     * @param {string} query - 検索クエリ
     * @returns {Array|null} キャッシュされた検索結果
     */
    getCachedSearchResults(query) {
        try {
            if (!this.searchCache) {
                return null;
            }

            const cacheKey = this.generateSearchCacheKey(query);
            if (!this.searchCache.has(cacheKey)) {
                return null;
            }

            const cacheEntry = this.searchCache.get(cacheKey);
            
            // 有効期限チェック
            if (Date.now() - cacheEntry.timestamp > this.cacheConfig.cacheExpiryTime) {
                this.searchCache.delete(cacheKey);
                return null;
            }

            // アクセス統計の更新
            cacheEntry.accessCount++;
            
            // データの展開
            const results = cacheEntry.compressed ? 
                this.decompressData(cacheEntry.data) : cacheEntry.data;

            this.loggingSystem.debug('HelpAnalytics', `Search results retrieved from cache: "${query}"`);
            return results;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to get cached search results', error);
            return null;
        }
    }

    /**
     * パフォーマンス監視機能
     */
    initializePerformanceMonitoring() {
        try {
            this.performanceMetrics = {
                operations: new Map(),
                cacheHitRate: 0,
                averageResponseTime: 0,
                errorRate: 0,
                memoryUsage: 0
            };

            // 定期的なメトリクス収集
            setInterval(() => {
                this.collectPerformanceMetrics();
            }, 30000); // 30秒間隔

            this.loggingSystem.debug('HelpAnalytics', 'Performance monitoring initialized');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to initialize performance monitoring', error);
        }
    }

    /**
     * 操作のパフォーマンス測定
     * @param {string} operationName - 操作名
     * @param {function} operation - 実行する操作
     * @returns {*} 操作結果
     */
    measurePerformance(operationName, operation) {
        const startTime = performance.now();
        let error = null;
        let result = null;

        try {
            result = operation();
        } catch (err) {
            error = err;
            throw err;
        } finally {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.recordOperationMetrics(operationName, duration, error);
        }

        return result;
    }

    /**
     * 操作メトリクスの記録
     * @param {string} operationName - 操作名
     * @param {number} duration - 実行時間
     * @param {Error|null} error - エラー情報
     */
    recordOperationMetrics(operationName, duration, error = null) {
        try {
            if (!this.performanceMetrics.operations.has(operationName)) {
                this.performanceMetrics.operations.set(operationName, {
                    totalCalls: 0,
                    totalDuration: 0,
                    averageDuration: 0,
                    errorCount: 0,
                    lastCall: 0
                });
            }

            const metrics = this.performanceMetrics.operations.get(operationName);
            metrics.totalCalls++;
            metrics.totalDuration += duration;
            metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;
            metrics.lastCall = Date.now();

            if (error) {
                metrics.errorCount++;
            }

            // パフォーマンス警告
            if (duration > 1000) { // 1秒以上
                this.loggingSystem.warn('HelpAnalytics', `Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
            }
        } catch (err) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record operation metrics', err);
        }
    }

    /**
     * パフォーマンスメトリクスの収集
     */
    collectPerformanceMetrics() {
        try {
            // キャッシュヒット率の計算
            let totalCacheRequests = 0;
            let cacheHits = 0;

            if (this.contentCache) {
                for (const entry of this.contentCache.values()) {
                    totalCacheRequests += entry.accessCount;
                    if (entry.accessCount > 0) cacheHits++;
                }
            }

            if (this.searchCache) {
                for (const entry of this.searchCache.values()) {
                    totalCacheRequests += entry.accessCount;
                    if (entry.accessCount > 0) cacheHits++;
                }
            }

            this.performanceMetrics.cacheHitRate = totalCacheRequests > 0 ? 
                (cacheHits / totalCacheRequests) * 100 : 0;

            // メモリ使用量の推定
            if (typeof process !== 'undefined' && process.memoryUsage) {
                this.performanceMetrics.memoryUsage = process.memoryUsage().heapUsed;
            }

            // エラー率の計算
            let totalOperations = 0;
            let totalErrors = 0;

            for (const metrics of this.performanceMetrics.operations.values()) {
                totalOperations += metrics.totalCalls;
                totalErrors += metrics.errorCount;
            }

            this.performanceMetrics.errorRate = totalOperations > 0 ? 
                (totalErrors / totalOperations) * 100 : 0;

            this.loggingSystem.debug('HelpAnalytics', 'Performance metrics collected', {
                cacheHitRate: this.performanceMetrics.cacheHitRate.toFixed(2) + '%',
                errorRate: this.performanceMetrics.errorRate.toFixed(2) + '%'
            });
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to collect performance metrics', error);
        }
    }

    /**
     * パフォーマンス最適化の実行
     */
    optimizePerformance() {
        try {
            // キャッシュの最適化
            this.optimizeCache();

            // データベースの最適化（該当する場合）
            this.optimizeDataStorage();

            // メモリの最適化
            this.optimizeMemoryUsage();

            this.loggingSystem.info('HelpAnalytics', 'Performance optimization completed');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to optimize performance', error);
        }
    }

    /**
     * ユーティリティメソッド群
     */
    compressData(data) {
        try {
            // シンプルなJSON圧縮（実際の実装ではより効率的な圧縮を使用）
            return JSON.stringify(data);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to compress data', error);
            return data;
        }
    }

    decompressData(compressedData) {
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to decompress data', error);
            return compressedData;
        }
    }

    generateSearchCacheKey(query) {
        return `search_${query.toLowerCase().replace(/\s+/g, '_')}`;
    }

    cleanupExpiredCache() {
        const now = Date.now();
        
        // コンテンツキャッシュのクリーンアップ
        if (this.contentCache) {
            for (const [key, entry] of this.contentCache.entries()) {
                if (now - entry.timestamp > this.cacheConfig.cacheExpiryTime) {
                    this.contentCache.delete(key);
                }
            }
        }

        // 検索キャッシュのクリーンアップ
        if (this.searchCache) {
            for (const [key, entry] of this.searchCache.entries()) {
                if (now - entry.timestamp > this.cacheConfig.cacheExpiryTime) {
                    this.searchCache.delete(key);
                }
            }
        }
    }

    evictLeastUsedContent() {
        if (!this.contentCache || this.contentCache.size === 0) return;

        let leastUsed = null;
        let minAccessCount = Infinity;

        for (const [key, entry] of this.contentCache.entries()) {
            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                leastUsed = key;
            }
        }

        if (leastUsed) {
            this.contentCache.delete(leastUsed);
        }
    }

    evictLeastUsedSearchResults() {
        if (!this.searchCache || this.searchCache.size === 0) return;

        let leastUsed = null;
        let minAccessCount = Infinity;

        for (const [key, entry] of this.searchCache.entries()) {
            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                leastUsed = key;
            }
        }

        if (leastUsed) {
            this.searchCache.delete(leastUsed);
        }
    }

    optimizeCache() {
        // キャッシュサイズの調整
        if (this.contentCache && this.contentCache.size > this.cacheConfig.maxContentCacheSize * 0.8) {
            // 使用頻度の低いアイテムを削除
            this.evictLeastUsedContent();
        }

        if (this.searchCache && this.searchCache.size > this.cacheConfig.maxSearchCacheSize * 0.8) {
            this.evictLeastUsedSearchResults();
        }
    }

    optimizeDataStorage() {
        // アナリティクスデータのサイズ最適化
        const maxAnalyticsAge = 30 * 24 * 60 * 60 * 1000; // 30日
        const cutoffTime = Date.now() - maxAnalyticsAge;

        // 古いセッションデータの削除
        if (this.sessions) {
            for (const [sessionId, session] of this.sessions.entries()) {
                if (session.startTime < cutoffTime) {
                    this.sessions.delete(sessionId);
                }
            }
        }

        // 古いイベントデータの削除（既存のcleanupOldEventsを使用）
        this.cleanupOldEvents();
    }

    optimizeMemoryUsage() {
        // 使用していないオブジェクトの参照をクリア
        if (this.currentSession && !this.currentSession.active) {
            // 非アクティブセッションのイベント配列を制限
            if (this.currentSession.events && this.currentSession.events.length > 100) {
                this.currentSession.events = this.currentSession.events.slice(-50);
            }
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