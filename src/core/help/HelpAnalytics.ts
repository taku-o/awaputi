/**
 * HelpAnalytics.ts
 * ヘルプシステムの使用状況を追跡・分析するクラス
 */

import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

// 型定義
export interface GameEngine {
    helpManager?: HelpManager;
    helpFeedbackSystem?: HelpFeedbackSystem;
    accessibilityManager?: AccessibilityManager;
}

export interface HelpManager {
    searchEngine?: SearchEngine;
    contentLoader?: ContentLoader;
}

export interface HelpFeedbackSystem {
    // フィードバックシステムのインターフェース
}

export interface AccessibilityManager {
    // アクセシビリティマネージャーのインターフェース
}

export interface SearchEngine {
    // 検索エンジンのインターフェース
}

export interface ContentLoader {
    // コンテンツローダーのインターフェース
}

export interface AnalyticsConfig {
    sessionTimeout: number;
    maxEvents: number;
    enableRealTimeTracking: boolean;
    enableOfflineStorage: boolean;
    dataRetentionDays: number;
}

export interface HelpUsageAnalytics {
    totalSessions: number;
    totalPageViews: number;
    uniqueUsers: Set<string>;
    averageSessionDuration: number;
    topHelpCategories: Map<string, number>;
    topHelpTopics: Map<string, number>;
    searchQueries: Map<string, number>;
    exitPoints: Map<string, number>;
}

export interface ContentAnalytics {
    topicViews: Map<string, TopicViewStats>;
    categoryViews: Map<string, CategoryViewStats>;
}

export interface TopicViewStats {
    viewCount: number;
    totalViewTime: number;
    exitCount: number;
}

export interface CategoryViewStats {
    viewCount: number;
    totalViewTime: number;
    exitCount: number;
}

export interface TutorialUsageAnalytics {
    totalStarts: number;
    totalCompletions: number;
    completionRate: number;
    averageCompletionTime: number;
    dropOffPoints: Map<string, number>;
    skipRates: Map<string, number>;
    retryRates: Map<string, number>;
}

export interface UserBehaviorAnalytics {
    navigationPatterns: Map<string, number>;
    timeSpentBySection: Map<string, TimeStats>;
    commonUserJourneys: Map<string, number>;
    bounceRate: number;
    returnUserRate: number;
}

export interface TimeStats {
    total: number;
    count: number;
    average: number;
}

export interface EffectivenessAnalytics {
    helpfulnessRatings: Map<string, RatingData>;
    problemResolutionRate: number;
    userSatisfactionScore: number;
    contentGaps: Map<string, number>;
    improvementSuggestions: ImprovementSuggestion[];
}

export interface RatingData {
    totalRatings: number;
    averageRating: number;
    ratingCount: Record<number, number>; // 1-5の評価ごとの件数
}

export interface ImprovementSuggestion {
    type: string;
    contentId?: string;
    query?: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Analytics {
    helpUsage: HelpUsageAnalytics;
    content: ContentAnalytics;
    tutorialUsage: TutorialUsageAnalytics;
    userBehavior: UserBehaviorAnalytics;
    effectiveness: EffectivenessAnalytics;
}

export interface HelpSession {
    id: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    entryPoint: string;
    exitPoint?: string;
    exitContext?: any;
    context: any;
    events: AnalyticsEvent[];
    pageViews: PageView[];
    searchQueries: SearchQuery[];
    currentPage: string | null;
    lastActivityTime: number;
    active?: boolean;
}

export interface AnalyticsEvent {
    type: string;
    data: any;
    timestamp: number;
    sessionId: string | null;
}

export interface PageView {
    page: string;
    timestamp: number;
    data: any;
    timeSpent: number;
}

export interface SearchQuery {
    query: string;
    timestamp: number;
    resultCount: number;
    results: SearchResult[];
}

export interface SearchResult {
    id: string;
    title: string;
    category: string;
}

export interface CacheConfig {
    maxContentCacheSize: number;
    maxSearchCacheSize: number;
    cacheExpiryTime: number;
    enableCompression: boolean;
}

export interface CacheEntry {
    data: any;
    timestamp: number;
    accessCount: number;
    compressed: boolean;
}

export interface PerformanceMetrics {
    operations: Map<string, OperationMetrics>;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
}

export interface OperationMetrics {
    totalCalls: number;
    totalDuration: number;
    averageDuration: number;
    errorCount: number;
    lastCall: number;
}

export interface ValidationResult {
    isValid: boolean;
    sanitizedData: any;
    errors: string[];
}

export interface ValidationComponents {
    analytics: boolean;
    feedback: boolean;
    search: boolean;
    content: boolean;
    accessibility: boolean;
}

export interface SystemValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    components: ValidationComponents;
}

export interface FallbackInterface {
    isActive: boolean;
    container: HTMLElement | null;
    content: Map<string, FallbackContent>;
    keydownHandler?: (event: KeyboardEvent) => void;
}

export interface FallbackContent {
    title: string;
    content: string[];
}

export interface UsageReport {
    generatedAt: number;
    period: ReportPeriod;
    usage: UsageReportData;
    effectiveness: EffectivenessReportData;
    performance: PerformanceReportData;
    recommendations: ImprovementSuggestion[];
}

export interface ReportPeriod {
    start: number;
    end: number;
}

export interface UsageReportData {
    totalSessions: number;
    totalPageViews: number;
    averageSessionDuration: number;
    searchQueries: number;
    topCategories: TopItem[];
    topSearches: TopItem[];
}

export interface EffectivenessReportData {
    averageRating: number;
    totalFeedbacks: number;
    satisfactionScore: number;
    problemAreas: ProblemArea[];
}

export interface PerformanceReportData {
    cacheHitRate: number;
    errorRate: number;
    operationsCount: number;
}

export interface TopItem {
    category?: string;
    topic?: string;
    query?: string;
    count: number;
}

export interface ProblemArea {
    type: 'low_rating' | 'content_gap';
    contentId?: string;
    query?: string;
    rating?: number;
    searchCount?: number;
    severity: 'high' | 'medium' | 'low';
}

export interface ContentPerformance {
    [contentId: string]: {
        averageRating: number;
        totalRatings: number;
        helpfulness: 'high' | 'medium' | 'low';
    };
}

export interface UserBehaviorReport {
    timeSpentBySection: Record<string, TimeStats>;
    navigationPatterns: Record<string, number>;
    commonJourneys: Record<string, number>;
}

export interface ReportData {
    [key: string]: any;
}

export interface AnalyticsReport {
    generatedAt: number;
    reportType: string;
    period: string;
    data: ReportData;
    error?: string;
}

export interface SummaryReportData {
    overview: {
        totalHelpSessions: number;
        totalPageViews: number;
        uniqueUsers: number;
        averageSessionDuration: number;
    };
    tutorialCompletionRate: number;
    topContent: {
        categories: TopItem[];
        topics: TopItem[];
    };
    searchQueries: TopItem[];
    userSatisfaction: {
        averageRating: number;
        totalFeedbacks: number;
        satisfactionScore: number;
    };
}

export interface EffectivenessReportDetailed {
    contentPerformance: ContentPerformance;
    userBehavior: UserBehaviorReport;
    problemAreas: ProblemArea[];
    improvements: ImprovementSuggestion[];
}

export interface SanitizationOptions {
    maxLength?: number;
    allowSpecialChars?: boolean;
    preserveWhitespace?: boolean;
}

export interface StoredAnalyticsData {
    analytics: Analytics;
    sessions: Array<[string, HelpSession]>;
    events: Array<[string, AnalyticsEvent]>;
    lastSaved: number;
}

export type DataType = 'categoryId' | 'topicId' | 'searchQuery' | 'feedback' | 'context';

/**
 * ヘルプシステムの使用状況を追跡・分析するクラス
 */
export class HelpAnalytics {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    // 追跡対象イベント
    private events: Map<string, AnalyticsEvent>;
    private sessions: Map<string, HelpSession>;
    private currentSession: HelpSession | null;
    // 設定
    private config: AnalyticsConfig;
    // 追跡データ
    private analytics: Analytics;
    // キャッシュ関連
    private contentCache?: Map<string, CacheEntry>;
    private searchCache?: Map<string, CacheEntry>;
    private cacheConfig?: CacheConfig;
    
    // パフォーマンス関連
    private performanceMetrics?: PerformanceMetrics;
    
    // フォールバック関連
    private fallbackInterface?: FallbackInterface;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // 追跡対象イベント
        this.events = new Map<string, AnalyticsEvent>();
        this.sessions = new Map<string, HelpSession>();
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
                uniqueUsers: new Set<string>(),
                averageSessionDuration: 0,
                topHelpCategories: new Map<string, number>(),
                topHelpTopics: new Map<string, number>(),
                searchQueries: new Map<string, number>(),
                exitPoints: new Map<string, number>()
            },
            content: {
                topicViews: new Map<string, TopicViewStats>(),
                categoryViews: new Map<string, CategoryViewStats>()
            },
            tutorialUsage: {
                totalStarts: 0,
                totalCompletions: 0,
                completionRate: 0,
                averageCompletionTime: 0,
                dropOffPoints: new Map<string, number>(),
                skipRates: new Map<string, number>(),
                retryRates: new Map<string, number>()
            },
            userBehavior: {
                navigationPatterns: new Map<string, number>(),
                timeSpentBySection: new Map<string, TimeStats>(),
                commonUserJourneys: new Map<string, number>(),
                bounceRate: 0,
                returnUserRate: 0
            },
            effectiveness: {
                helpfulnessRatings: new Map<string, RatingData>(),
                problemResolutionRate: 0,
                userSatisfactionScore: 0,
                contentGaps: new Map<string, number>(),
                improvementSuggestions: []
            }
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    private initialize(): void {
        try {
            // ローカルストレージからデータを復元
            this.loadAnalyticsData();
            // Mapオブジェクトの確実な初期化（復元データが壊れている場合の対策）
            this.ensureMapInitialization();
            // ヘルプシステムの初期化検証
            const validationResult = this.validateHelpSystemInitialization();
            // コンテンツキャッシングの初期化
            this.initializeContentCaching();
            // パフォーマンス監視の初期化
            this.initializePerformanceMonitoring();
            // フォールバックインターフェースの準備
            if (!validationResult.isValid) {
                this.initializeFallbackInterface();
            }
            // セッション管理の開始
            this.startSessionTracking();
            
            // 定期的なデータ保存とメンテナンス
            this.setupPeriodicSave();
            this.setupPeriodicMaintenance();
            // ページ離脱時の処理
            this.setupUnloadHandlers();
            
            this.loggingSystem.info('HelpAnalytics', 'Help analytics initialized', {
                validation: validationResult.isValid ? 'passed' : 'failed',
                fallbackReady: !!this.fallbackInterface
            });
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to initialize help analytics', error);
            ErrorHandler.handle(error as Error, 'HelpAnalytics.initialize');
        }
    }
    
    /**
     * Mapオブジェクトの確実な初期化
     */
    private ensureMapInitialization(): void {
        try {
            // helpUsageセクション
            if (!(this.analytics.helpUsage.topHelpCategories instanceof Map)) {
                this.analytics.helpUsage.topHelpCategories = new Map<string, number>();
            }
            if (!(this.analytics.helpUsage.topHelpTopics instanceof Map)) {
                this.analytics.helpUsage.topHelpTopics = new Map<string, number>();
            }
            if (!(this.analytics.helpUsage.searchQueries instanceof Map)) {
                this.analytics.helpUsage.searchQueries = new Map<string, number>();
            }
            if (!(this.analytics.helpUsage.exitPoints instanceof Map)) {
                this.analytics.helpUsage.exitPoints = new Map<string, number>();
            }
            
            // contentセクション
            if(!this.analytics.content || typeof this.analytics.content !== 'object') {
                this.analytics.content = {
                    topicViews: new Map<string, TopicViewStats>(),
                    categoryViews: new Map<string, CategoryViewStats>()
                };
            }
            if (!(this.analytics.content.topicViews instanceof Map)) {
                this.analytics.content.topicViews = new Map<string, TopicViewStats>();
            }
            if (!(this.analytics.content.categoryViews instanceof Map)) {
                this.analytics.content.categoryViews = new Map<string, CategoryViewStats>();
            }
            // 他の必要なMapオブジェクト
            if (!(this.analytics.tutorialUsage.dropOffPoints instanceof Map)) {
                this.analytics.tutorialUsage.dropOffPoints = new Map<string, number>();
            }
            if (!(this.analytics.tutorialUsage.skipRates instanceof Map)) {
                this.analytics.tutorialUsage.skipRates = new Map<string, number>();
            }
            if (!(this.analytics.tutorialUsage.retryRates instanceof Map)) {
                this.analytics.tutorialUsage.retryRates = new Map<string, number>();
            }
            if (!(this.analytics.userBehavior.navigationPatterns instanceof Map)) {
                this.analytics.userBehavior.navigationPatterns = new Map<string, number>();
            }
            if (!(this.analytics.userBehavior.timeSpentBySection instanceof Map)) {
                this.analytics.userBehavior.timeSpentBySection = new Map<string, TimeStats>();
            }
            if (!(this.analytics.userBehavior.commonUserJourneys instanceof Map)) {
                this.analytics.userBehavior.commonUserJourneys = new Map<string, number>();
            }
            if (!(this.analytics.effectiveness.helpfulnessRatings instanceof Map)) {
                this.analytics.effectiveness.helpfulnessRatings = new Map<string, RatingData>();
            }
            if (!(this.analytics.effectiveness.contentGaps instanceof Map)) {
                this.analytics.effectiveness.contentGaps = new Map<string, number>();
            }

            this.loggingSystem.debug('HelpAnalytics', 'Map initialization completed');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to ensure map initialization', error);
        }
    }
    
    /**
     * ヘルプセッションの開始
     * @param entryPoint - 入口ポイント
     * @param context - コンテキスト情報
     */
    startHelpSession(entryPoint: string, context: any = {}): void {
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
     * @param exitPoint - 終了ポイント
     * @param exitContext - 終了コンテキスト
     */
    endHelpSession(exitPoint: string, exitContext: any = {}): void {
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
     * @param page - ページ名
     * @param pageData - ページデータ
     */
    trackPageView(page: string, pageData: any = {}): void {
        try {
            const timestamp = Date.now();
            
            // 現在のページビューの終了処理
            if (this.currentSession?.currentPage) {
                const lastPageView = this.currentSession.pageViews.find(pv => pv.page === this.currentSession!.currentPage);
                if (lastPageView) {
                    lastPageView.timeSpent = timestamp - lastPageView.timestamp;
                }
            }
            
            const pageView: PageView = {
                page: page,
                timestamp: timestamp,
                data: pageData,
                timeSpent: 0
            };
            
            if (this.currentSession) {
                this.currentSession.pageViews.push(pageView);
                this.currentSession.currentPage = page;
                this.currentSession.lastActivityTime = timestamp;
            }
            
            // 全体統計の更新
            this.analytics.helpUsage.totalPageViews++;
            
            // カテゴリ別統計の更新
            if (pageData.category) {
                const current = this.analytics.helpUsage.topHelpCategories.get(pageData.category) || 0;
                this.analytics.helpUsage.topHelpCategories.set(pageData.category, current + 1);
                
                // コンテンツ分析用の統計更新
                this.updateContentAnalytics(pageData.category, pageData);
            }
            
            // トピック別統計の更新
            if (pageData.topic) {
                const current = this.analytics.helpUsage.topHelpTopics.get(pageData.topic) || 0;
                this.analytics.helpUsage.topHelpTopics.set(pageData.topic, current + 1);
            }
            
            this.trackEvent('page_view', {
                page: page,
                category: pageData.category,
                topic: pageData.topic
            });

            this.loggingSystem.debug('HelpAnalytics', `Page view tracked: ${page}`, pageData);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track page view', error);
        }
    }
    
    /**
     * 検索クエリの追跡
     * @param query - 検索クエリ
     * @param resultCount - 結果数
     * @param results - 検索結果
     */
    trackSearchQuery(query: string, resultCount: number = 0, results: SearchResult[] = []): void {
        try {
            const timestamp = Date.now();
            const searchQuery: SearchQuery = {
                query: query,
                timestamp: timestamp,
                resultCount: resultCount,
                results: results
            };
            
            if (this.currentSession) {
                this.currentSession.searchQueries.push(searchQuery);
                this.currentSession.lastActivityTime = timestamp;
            }
            
            // 検索統計の更新
            const current = this.analytics.helpUsage.searchQueries.get(query) || 0;
            this.analytics.helpUsage.searchQueries.set(query, current + 1);
            
            // コンテンツギャップの分析（結果が少ない検索クエリを記録）
            if (resultCount < 3) {
                const gapCount = this.analytics.effectiveness.contentGaps.get(query) || 0;
                this.analytics.effectiveness.contentGaps.set(query, gapCount + 1);
            }
            
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
     * カテゴリ選択の追跡
     * @param categoryId - カテゴリID
     * @param categoryData - カテゴリデータ
     */
    recordCategorySelection(categoryId: string, categoryData: any = {}): void {
        try {
            // カテゴリ選択イベントの記録
            this.trackEvent('category_selected', {
                categoryId: categoryId,
                timestamp: Date.now(),
                ...categoryData
            });
            
            // ユーザー行動パターンの更新
            const navigationKey = `category_${categoryId}`;
            const current = this.analytics.userBehavior.navigationPatterns.get(navigationKey) || 0;
            this.analytics.userBehavior.navigationPatterns.set(navigationKey, current + 1);
            
            this.loggingSystem.debug('HelpAnalytics', `Category selection recorded: ${categoryId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to record category selection', error);
        }
    }
    
    /**
     * フィードバックの追跡
     * @param contentId - コンテンツID
     * @param rating - 評価（1-5）
     * @param feedback - フィードバック内容
     */
    trackFeedback(contentId: string, rating: number, feedback: string = ''): void {
        try {
            // フィードバック統計の更新
            const currentRating = this.analytics.effectiveness.helpfulnessRatings.get(contentId) || {
                totalRatings: 0,
                averageRating: 0,
                ratingCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
            
            currentRating.totalRatings++;
            currentRating.ratingCount[rating] = (currentRating.ratingCount[rating] || 0) + 1;
            currentRating.averageRating = this.calculateWeightedAverage(currentRating.ratingCount);
            
            this.analytics.effectiveness.helpfulnessRatings.set(contentId, currentRating);
            
            // 全体満足度スコアの更新
            this.updateOverallSatisfactionScore();
            
            // 低評価コンテンツの改善提案生成
            if (rating <= 2) {
                this.generateImprovementSuggestion(contentId, 'low_rating', rating, feedback);
            }
            
            this.trackEvent('feedback_submitted', {
                contentId: contentId,
                rating: rating,
                feedback: feedback.substring(0, 100) // プライバシー配慮で最初の100文字のみ
            });

            this.loggingSystem.debug('HelpAnalytics', `Feedback tracked for ${contentId}: ${rating}/5`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track feedback', error);
        }
    }
    
    /**
     * チュートリアルの開始追跡
     * @param tutorialId - チュートリアルID
     * @param context - コンテキスト
     */
    trackTutorialStart(tutorialId: string, context: any = {}): void {
        try {
            this.analytics.tutorialUsage.totalStarts++;
            
            this.trackEvent('tutorial_started', {
                tutorialId: tutorialId,
                context: context
            });

            this.loggingSystem.debug('HelpAnalytics', `Tutorial start tracked: ${tutorialId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial start', error);
        }
    }
    
    /**
     * チュートリアルの完了追跡
     * @param tutorialId - チュートリアルID
     * @param completionTime - 完了時間
     */
    trackTutorialCompletion(tutorialId: string, completionTime: number): void {
        try {
            this.analytics.tutorialUsage.totalCompletions++;
            
            // 完了率の計算
            if (this.analytics.tutorialUsage.totalStarts > 0) {
                this.analytics.tutorialUsage.completionRate = 
                    (this.analytics.tutorialUsage.totalCompletions / this.analytics.tutorialUsage.totalStarts) * 100;
            }
            
            // 平均完了時間の更新
            const totalTime = this.analytics.tutorialUsage.averageCompletionTime * 
                (this.analytics.tutorialUsage.totalCompletions - 1) + completionTime;
            this.analytics.tutorialUsage.averageCompletionTime = 
                totalTime / this.analytics.tutorialUsage.totalCompletions;
            
            this.trackEvent('tutorial_completed', {
                tutorialId: tutorialId,
                completionTime: completionTime
            });

            this.loggingSystem.debug('HelpAnalytics', `Tutorial completion tracked: ${tutorialId} (${completionTime}ms)`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial completion', error);
        }
    }
    
    /**
     * チュートリアルのドロップオフ追跡
     * @param tutorialId - チュートリアルID
     * @param stepId - ドロップオフしたステップID
     */
    trackTutorialDropOff(tutorialId: string, stepId: string): void {
        try {
            const dropOffKey = `${tutorialId}_${stepId}`;
            const current = this.analytics.tutorialUsage.dropOffPoints.get(dropOffKey) || 0;
            this.analytics.tutorialUsage.dropOffPoints.set(dropOffKey, current + 1);
            
            this.trackEvent('tutorial_drop_off', {
                tutorialId: tutorialId,
                stepId: stepId
            });

            this.loggingSystem.debug('HelpAnalytics', `Tutorial drop-off tracked: ${tutorialId} at ${stepId}`);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track tutorial drop-off', error);
        }
    }
    
    /**
     * 一般的なイベント追跡
     * @param eventType - イベントタイプ
     * @param eventData - イベントデータ
     */
    trackEvent(eventType: string, eventData: any = {}): void {
        try {
            const timestamp = Date.now();
            const event: AnalyticsEvent = {
                type: eventType,
                data: eventData,
                timestamp: timestamp,
                sessionId: this.currentSession?.id || null
            };
            
            const eventId = `${eventType}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            this.events.set(eventId, event);
            
            if (this.currentSession) {
                this.currentSession.events.push(event);
                this.currentSession.lastActivityTime = timestamp;
            }
            
            // イベント数制限の適用
            if (this.events.size > this.config.maxEvents) {
                this.pruneOldEvents();
            }

            this.loggingSystem.debug('HelpAnalytics', `Event tracked: ${eventType}`, eventData);
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to track event', error);
        }
    }
    
    /**
     * 分析データの取得
     * @returns 分析データ
     */
    getAnalytics(): Analytics {
        return this.analytics;
    }
    
    /**
     * 使用状況レポートの生成
     * @param period - レポート期間
     * @returns 使用状況レポート
     */
    generateUsageReport(period?: ReportPeriod): UsageReport {
        try {
            const now = Date.now();
            const reportPeriod: ReportPeriod = period || {
                start: now - (7 * 24 * 60 * 60 * 1000), // 過去7日
                end: now
            };
            
            const filteredSessions = this.filterSessionsByPeriod(reportPeriod);
            
            const usageData = this.generateUsageReportData(filteredSessions);
            const effectivenessData = this.generateEffectivenessReportData();
            const performanceData = this.generatePerformanceReportData();
            const recommendations = this.generateRecommendations();
            
            const report: UsageReport = {
                generatedAt: now,
                period: reportPeriod,
                usage: usageData,
                effectiveness: effectivenessData,
                performance: performanceData,
                recommendations: recommendations
            };

            this.loggingSystem.info('HelpAnalytics', 'Usage report generated', {
                period: reportPeriod,
                sessionsAnalyzed: filteredSessions.length
            });
            
            return report;
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to generate usage report', error);
            throw error;
        }
    }
    
    /**
     * データのエクスポート
     * @param format - エクスポート形式
     * @returns エクスポートされたデータ
     */
    exportData(format: 'json' | 'csv' = 'json'): string {
        try {
            const exportData = {
                analytics: this.analytics,
                sessions: Array.from(this.sessions.entries()),
                events: Array.from(this.events.entries()),
                exportedAt: Date.now()
            };
            
            if (format === 'json') {
                return JSON.stringify(exportData, (key, value) => {
                    if (value instanceof Map) {
                        return Array.from(value.entries());
                    }
                    if (value instanceof Set) {
                        return Array.from(value);
                    }
                    return value;
                }, 2);
            } else {
                // CSV形式の簡易実装
                return this.convertToCSV(exportData);
            }
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to export data', error);
            throw error;
        }
    }
    
    /**
     * 分析データのリセット
     */
    resetAnalytics(): void {
        try {
            this.events.clear();
            this.sessions.clear();
            this.currentSession = null;
            
            // 分析データの初期化
            this.analytics = {
                helpUsage: {
                    totalSessions: 0,
                    totalPageViews: 0,
                    uniqueUsers: new Set<string>(),
                    averageSessionDuration: 0,
                    topHelpCategories: new Map<string, number>(),
                    topHelpTopics: new Map<string, number>(),
                    searchQueries: new Map<string, number>(),
                    exitPoints: new Map<string, number>()
                },
                content: {
                    topicViews: new Map<string, TopicViewStats>(),
                    categoryViews: new Map<string, CategoryViewStats>()
                },
                tutorialUsage: {
                    totalStarts: 0,
                    totalCompletions: 0,
                    completionRate: 0,
                    averageCompletionTime: 0,
                    dropOffPoints: new Map<string, number>(),
                    skipRates: new Map<string, number>(),
                    retryRates: new Map<string, number>()
                },
                userBehavior: {
                    navigationPatterns: new Map<string, number>(),
                    timeSpentBySection: new Map<string, TimeStats>(),
                    commonUserJourneys: new Map<string, number>(),
                    bounceRate: 0,
                    returnUserRate: 0
                },
                effectiveness: {
                    helpfulnessRatings: new Map<string, RatingData>(),
                    problemResolutionRate: 0,
                    userSatisfactionScore: 0,
                    contentGaps: new Map<string, number>(),
                    improvementSuggestions: []
                }
            };

            this.loggingSystem.info('HelpAnalytics', 'Analytics data reset');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to reset analytics', error);
        }
    }
    
    /**
     * リソースの破棄
     */
    destroy(): void {
        try {
            // アクティブセッションの終了
            if (this.currentSession) {
                this.endHelpSession('system_shutdown');
            }
            
            // データの保存
            this.saveAnalyticsData();
            
            // リソースのクリーンアップ
            this.events.clear();
            this.sessions.clear();
            
            // キャッシュのクリーンアップ
            this.contentCache?.clear();
            this.searchCache?.clear();
            
            this.loggingSystem.info('HelpAnalytics', 'Help analytics destroyed');
        } catch (error) {
            this.loggingSystem.error('HelpAnalytics', 'Failed to destroy help analytics', error);
        }
    }
    
    // -------- プライベートメソッド --------
    
    private generateSessionId(): string {
        return `help_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    private updateSessionStatistics(session: HelpSession): void {
        if (!session.duration) return;
        
        // 平均セッション時間の更新
        const totalDuration = this.analytics.helpUsage.averageSessionDuration * 
            (this.analytics.helpUsage.totalSessions - 1) + session.duration;
        this.analytics.helpUsage.averageSessionDuration = 
            totalDuration / this.analytics.helpUsage.totalSessions;
        
        // 終了ポイントの追跡
        if (session.exitPoint) {
            const current = this.analytics.helpUsage.exitPoints.get(session.exitPoint) || 0;
            this.analytics.helpUsage.exitPoints.set(session.exitPoint, current + 1);
        }
    }
    
    private updateContentAnalytics(category: string, data: any): void {
        // カテゴリビューの更新
        const categoryStats = this.analytics.content.categoryViews.get(category) || {
            viewCount: 0,
            totalViewTime: 0,
            exitCount: 0
        };
        
        categoryStats.viewCount++;
        this.analytics.content.categoryViews.set(category, categoryStats);
        
        // トピックビューの更新（トピックが指定されている場合）
        if (data.topic) {
            const topicStats = this.analytics.content.topicViews.get(data.topic) || {
                viewCount: 0,
                totalViewTime: 0,
                exitCount: 0
            };
            
            topicStats.viewCount++;
            this.analytics.content.topicViews.set(data.topic, topicStats);
        }
    }
    
    private calculateWeightedAverage(ratingCount: Record<number, number>): number {
        let totalScore = 0;
        let totalRatings = 0;
        
        for (const [rating, count] of Object.entries(ratingCount)) {
            totalScore += parseInt(rating) * count;
            totalRatings += count;
        }
        
        return totalRatings > 0 ? totalScore / totalRatings : 0;
    }
    
    private updateOverallSatisfactionScore(): void {
        let totalScore = 0;
        let totalRatings = 0;
        
        for (const ratingData of this.analytics.effectiveness.helpfulnessRatings.values()) {
            totalScore += ratingData.averageRating * ratingData.totalRatings;
            totalRatings += ratingData.totalRatings;
        }
        
        this.analytics.effectiveness.userSatisfactionScore = 
            totalRatings > 0 ? totalScore / totalRatings : 0;
    }
    
    private generateImprovementSuggestion(
        contentId: string, 
        type: string, 
        rating?: number, 
        feedback?: string
    ): void {
        const suggestion: ImprovementSuggestion = {
            type: type,
            contentId: contentId,
            suggestion: this.generateSuggestionText(type, rating, feedback),
            priority: rating && rating <= 2 ? 'high' : 'medium'
        };
        
        this.analytics.effectiveness.improvementSuggestions.push(suggestion);
    }
    
    private generateSuggestionText(type: string, rating?: number, feedback?: string): string {
        switch (type) {
            case 'low_rating':
                return `コンテンツの改善が必要です（評価: ${rating}/5）。${feedback ? 'ユーザーフィードバック: ' + feedback.substring(0, 50) : ''}`;
            case 'content_gap':
                return 'この検索クエリに対する適切なコンテンツが不足している可能性があります。';
            default:
                return 'コンテンツの改善を検討してください。';
        }
    }
    
    private pruneOldEvents(): void {
        const cutoffTime = Date.now() - (this.config.dataRetentionDays * 24 * 60 * 60 * 1000);
        const toDelete: string[] = [];
        
        for (const [eventId, event] of this.events.entries()) {
            if (event.timestamp < cutoffTime) {
                toDelete.push(eventId);
            }
        }
        
        for (const eventId of toDelete) {
            this.events.delete(eventId);
        }
    }
    
    private filterSessionsByPeriod(period: ReportPeriod): HelpSession[] {
        const filteredSessions: HelpSession[] = [];
        
        for (const session of this.sessions.values()) {
            if (session.startTime >= period.start && session.startTime <= period.end) {
                filteredSessions.push(session);
            }
        }
        
        return filteredSessions;
    }
    
    private generateUsageReportData(sessions: HelpSession[]): UsageReportData {
        const totalPageViews = sessions.reduce((sum, session) => sum + session.pageViews.length, 0);
        const totalSearchQueries = sessions.reduce((sum, session) => sum + session.searchQueries.length, 0);
        const averageDuration = sessions.length > 0 ? 
            sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length : 0;
        
        const topCategories = this.getTopItems(this.analytics.helpUsage.topHelpCategories, 'category');
        const topSearches = this.getTopItems(this.analytics.helpUsage.searchQueries, 'query');
        
        return {
            totalSessions: sessions.length,
            totalPageViews: totalPageViews,
            averageSessionDuration: averageDuration,
            searchQueries: totalSearchQueries,
            topCategories: topCategories,
            topSearches: topSearches
        };
    }
    
    private generateEffectivenessReportData(): EffectivenessReportData {
        let totalRating = 0;
        let totalFeedbacks = 0;
        
        for (const ratingData of this.analytics.effectiveness.helpfulnessRatings.values()) {
            totalRating += ratingData.averageRating * ratingData.totalRatings;
            totalFeedbacks += ratingData.totalRatings;
        }
        
        const averageRating = totalFeedbacks > 0 ? totalRating / totalFeedbacks : 0;
        
        return {
            averageRating: averageRating,
            totalFeedbacks: totalFeedbacks,
            satisfactionScore: this.analytics.effectiveness.userSatisfactionScore,
            problemAreas: this.identifyProblemAreas()
        };
    }
    
    private generatePerformanceReportData(): PerformanceReportData {
        return {
            cacheHitRate: this.performanceMetrics?.cacheHitRate || 0,
            errorRate: this.performanceMetrics?.errorRate || 0,
            operationsCount: this.performanceMetrics?.operations.size || 0
        };
    }
    
    private generateRecommendations(): ImprovementSuggestion[] {
        return this.analytics.effectiveness.improvementSuggestions.slice(0, 10); // 最大10件
    }
    
    private getTopItems(map: Map<string, number>, type: 'category' | 'topic' | 'query'): TopItem[] {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([key, count]) => {
                const item: TopItem = { count };
                item[type] = key;
                return item;
            });
    }
    
    private identifyProblemAreas(): ProblemArea[] {
        const problemAreas: ProblemArea[] = [];
        
        // 低評価コンテンツの特定
        for (const [contentId, ratingData] of this.analytics.effectiveness.helpfulnessRatings.entries()) {
            if (ratingData.averageRating < 3 && ratingData.totalRatings >= 5) {
                problemAreas.push({
                    type: 'low_rating',
                    contentId: contentId,
                    rating: ratingData.averageRating,
                    severity: ratingData.averageRating < 2 ? 'high' : 'medium'
                });
            }
        }
        
        // コンテンツギャップの特定
        for (const [query, count] of this.analytics.effectiveness.contentGaps.entries()) {
            if (count >= 10) {
                problemAreas.push({
                    type: 'content_gap',
                    query: query,
                    searchCount: count,
                    severity: count >= 50 ? 'high' : count >= 20 ? 'medium' : 'low'
                });
            }
        }
        
        return problemAreas.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }
    
    private convertToCSV(data: any): string {
        // 簡易CSV変換（実装は省略）
        return 'CSV conversion not implemented';
    }
    
    private loadAnalyticsData(): void {
        try {
            const storedData = localStorage.getItem('helpAnalytics');
            if (storedData) {
                const parsed = JSON.parse(storedData) as StoredAnalyticsData;
                // Map and Set objects need special handling
                this.restoreMapAndSetObjects(parsed);
            }
        } catch (error) {
            this.loggingSystem.warn('HelpAnalytics', 'Failed to load stored analytics data', error);
        }
    }
    
    private restoreMapAndSetObjects(data: StoredAnalyticsData): void {
        // Map and Set objects restoration logic would go here
        // This is a placeholder for the complex restoration process
    }
    
    private saveAnalyticsData(): void {
        try {
            const dataToStore: StoredAnalyticsData = {
                analytics: this.analytics,
                sessions: Array.from(this.sessions.entries()).slice(-100), // 最新100セッション
                events: Array.from(this.events.entries()).slice(-1000), // 最新1000イベント
                lastSaved: Date.now()
            };
            
            localStorage.setItem('helpAnalytics', JSON.stringify(dataToStore, (key, value) => {
                if (value instanceof Map) {
                    return Array.from(value.entries());
                }
                if (value instanceof Set) {
                    return Array.from(value);
                }
                return value;
            }));
        } catch (error) {
            this.loggingSystem.warn('HelpAnalytics', 'Failed to save analytics data', error);
        }
    }
    
    private validateHelpSystemInitialization(): SystemValidationResult {
        const result: SystemValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            components: {
                analytics: true,
                feedback: false,
                search: false,
                content: false,
                accessibility: false
            }
        };
        
        // Component validation logic would go here
        return result;
    }
    
    private initializeContentCaching(): void {
        this.cacheConfig = {
            maxContentCacheSize: 100,
            maxSearchCacheSize: 50,
            cacheExpiryTime: 30 * 60 * 1000, // 30分
            enableCompression: true
        };
        
        this.contentCache = new Map<string, CacheEntry>();
        this.searchCache = new Map<string, CacheEntry>();
    }
    
    private initializePerformanceMonitoring(): void {
        this.performanceMetrics = {
            operations: new Map<string, OperationMetrics>(),
            cacheHitRate: 0,
            averageResponseTime: 0,
            errorRate: 0,
            memoryUsage: 0
        };
    }
    
    private initializeFallbackInterface(): void {
        this.fallbackInterface = {
            isActive: false,
            container: null,
            content: new Map<string, FallbackContent>()
        };
    }
    
    private startSessionTracking(): void {
        // セッション追跡の開始ロジック
        this.loggingSystem.debug('HelpAnalytics', 'Session tracking started');
    }
    
    private setupPeriodicSave(): void {
        setInterval(() => {
            this.saveAnalyticsData();
        }, 5 * 60 * 1000); // 5分ごと
    }
    
    private setupPeriodicMaintenance(): void {
        setInterval(() => {
            this.pruneOldEvents();
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // 1時間ごと
    }
    
    private setupUnloadHandlers(): void {
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.endHelpSession('page_unload');
            }
            this.saveAnalyticsData();
        });
    }
    
    private cleanupExpiredSessions(): void {
        const cutoffTime = Date.now() - this.config.sessionTimeout;
        const toDelete: string[] = [];
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.lastActivityTime < cutoffTime && !session.endTime) {
                // セッションをタイムアウトとして終了
                session.endTime = Date.now();
                session.duration = session.endTime - session.startTime;
                session.exitPoint = 'timeout';
                this.updateSessionStatistics(session);
                toDelete.push(sessionId);
            }
        }
        
        // 古いセッションを削除
        for (const sessionId of toDelete) {
            this.sessions.delete(sessionId);
        }
    }
}

// シングルトンインスタンス管理
let helpAnalyticsInstance: HelpAnalytics | null = null;

/**
 * HelpAnalyticsのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジン
 * @returns HelpAnalyticsインスタンス
 */
export function getHelpAnalytics(gameEngine: GameEngine): HelpAnalytics {
    if (!helpAnalyticsInstance) {
        helpAnalyticsInstance = new HelpAnalytics(gameEngine);
    }
    return helpAnalyticsInstance;
}

/**
 * HelpAnalyticsインスタンスを再初期化
 * @param gameEngine - ゲームエンジン
 * @returns 新しいHelpAnalyticsインスタンス
 */
export function reinitializeHelpAnalytics(gameEngine: GameEngine): HelpAnalytics {
    if (helpAnalyticsInstance) {
        helpAnalyticsInstance.destroy();
    }
    helpAnalyticsInstance = new HelpAnalytics(gameEngine);
    return helpAnalyticsInstance;
}

export default HelpAnalytics;