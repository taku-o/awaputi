import { LoggingSystem  } from '../LoggingSystem.js';
import { ErrorHandler  } from '../../utils/ErrorHandler.js';
import { ScenesBaseDialog  } from '../../scenes/components/ScenesBaseDialog.js';

// 型定義
export interface FeedbackConfig { enableRatingPrompts: boolean,
    enableTextFeedback: boolean;
    enableQuickFeedback: boolean;
    showAfterViewTime: number;
    maxFeedbacksPerSession: number;
    enableOfflineStorage: boolean,
    submitRetryAttempts: number ,}

export interface FeedbackState { feedbacksShownThisSession: number,
    contentViewTimes: Map<string, number>,
    viewStartTimes: Map<string, number>,
    suppressedContent: Set<string>;
    lastFeedbackTime: number;
    feedbackData: Map<string, FeedbackStatistics>, }

export interface FeedbackData { contentId: string,
    rating?: number;
    comment: string;
    helpful?: boolean;
    categories: string[];
    timestamp: number;
    sessionId: string;
    userAgent: string;
    screenSize: string,
    language: string ,}

export interface FeedbackStatistics { ratings: number[];
    comments: string[],
    totalFeedbacks: number }

export interface FeedbackSubmissionData { rating?: number;
    helpful?: boolean;
    comment?: string;
    categories?: string[]; }

export interface FeedbackSubmissionResult { success: boolean,
    error?: string }

export interface FeedbackAnalytics { totalFeedbacks: number;
    averageRating: number,
    ratingDistribution: Record<number, number>,
    helpfulPercentage: number,
    commonCategories: Map<string, number>,
    topRatedContent: [string, number][],
    lowRatedContent: [string, number][], }

export interface SavedFeedbackData { feedbacks: [string, FeedbackData][],
    pendingFeedbacks: PendingFeedback[];
    state: SavedFeedbackState,
    lastSaved: number ,}

export interface SavedFeedbackState { feedbacksShownThisSession: number;
    suppressedContent: string[],
    contentViewTimes: [string, number][],
    viewStartTimes: [string, number][],
    lastFeedbackTime: number,
    feedbackData: [string, FeedbackStatistics][], }

export interface PendingFeedback { contentId: string,
    feedbackData: FeedbackSubmissionData
    ,}

export interface DialogButton { text: string,
    action: () => void;
    isPrimary?: boolean 
    }

export interface DialogConfig { title: string;
    content: string,
    buttons: DialogButton[]
    }

// GameEngine インターフェース
export interface GameEngine { localizationManager?: LocalizationManager;
    helpAnalytics?: HelpAnalytics;
    }

export interface LocalizationManager { t(key: string, defaultValue?: string): string;
    getCurrentLanguage?(): string; }

export interface HelpAnalytics { trackUserFeedback(
        contentId: string;
        rating?: number);
        comment?: string);
        metadata?: Record<string, any>;
    ): void; }

/**
 * ヘルプコンテンツに対するフィードバック収集システム
 */
export class HelpFeedbackSystem {
    private gameEngine: GameEngine;
    private loggingSystem: LoggingSystem;
    // フィードバックダイアログ
    private feedbackDialog: HelpFeedbackDialog | null;
    private currentContentId: string | null;
    // フィードバックデータ
    private, feedbacks: Map<string, FeedbackData>;
    private pendingFeedbacks: PendingFeedback[];
    // 設定
    private config: FeedbackConfig;
    // フィードバック状態
    private, state: FeedbackState;
    constructor(gameEngine: GameEngine) {

        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // フィードバックダイアログ
        this.feedbackDialog = null;
        this.currentContentId = null;
        
        // フィードバックデータ
        this.feedbacks = new Map<string, FeedbackData>();
        this.pendingFeedbacks = [];
        
        // 設定
        this.config = {
            enableRatingPrompts: true;
            enableTextFeedback: true;
            enableQuickFeedback: true,
    showAfterViewTime: 30000, // 30秒後に表示;
            maxFeedbacksPerSession: 3,
    enableOfflineStorage: true;
    ,}
            submitRetryAttempts: 3 
    };
        // フィードバック状態
        this.state = { feedbacksShownThisSession: 0,
            contentViewTimes: new Map<string, number>(),
            viewStartTimes: new Map<string, number>(),
            suppressedContent: new Set<string>();
            lastFeedbackTime: 0;
            feedbackData: new Map<string, FeedbackStatistics>( };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    private initialize(): void { try {
            // 保存されたフィードバックデータの読み込み
            this.loadFeedbackData();
            // イベントリスナーの設定
            this.setupEventListeners()';
            this.loggingSystem.info('HelpFeedbackSystem', 'Help feedback system initialized';' }

        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to initialize feedback system', error';''
            ErrorHandler.handle(error as Error, 'HelpFeedbackSystem.initialize'; }'
    }
    
    /**
     * コンテンツ表示の開始を追跡
     * @param contentId - コンテンツID
     * @param contentData - コンテンツデータ
     */
    startContentView(contentId: string, contentData: Record<string, any> = { ): void {
        try {
            const now = Date.now();
            this.state.viewStartTimes.set(contentId, now);
            
            // 既存のビュータイムがある場合は累積
            const existingTime = this.state.contentViewTimes.get(contentId) || 0;''
            this.state.contentViewTimes.set(contentId, existingTime);

            ' }'

            this.loggingSystem.debug('HelpFeedbackSystem', `Content view started: ${contentId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to start content view tracking', error); }
    }
    
    /**
     * コンテンツ表示の終了を追跡
     * @param contentId - コンテンツID
     */
    endContentView(contentId: string): void { try {
            const startTime = this.state.viewStartTimes.get(contentId);
            if (!startTime) return;
            
            const viewDuration = Date.now() - startTime;
            const existingTime = this.state.contentViewTimes.get(contentId) || 0;
            const totalViewTime = existingTime + viewDuration;
            
            this.state.contentViewTimes.set(contentId, totalViewTime);
            this.state.viewStartTimes.delete(contentId);
            ';
            // フィードバック表示の判定
            this.checkShouldShowFeedback(contentId, totalViewTime);

            ' }'

            this.loggingSystem.debug('HelpFeedbackSystem', `Content view ended: ${contentId}, duration: ${viewDuration}ms`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to end content view tracking', error); }
    }
    
    /**
     * フィードバック表示の判定
     * @param contentId - コンテンツID
     * @param viewTime - 表示時間
     */
    private checkShouldShowFeedback(contentId: string, viewTime: number): void { try {
            // 表示条件のチェック
            if (!this.config.enableRatingPrompts) return;
            if (this.state.feedbacksShownThisSession >= this.config.maxFeedbacksPerSession) return;
            if(this.state.suppressedContent.has(contentId) return;
            if (viewTime < this.config.showAfterViewTime) return;
            
            // 既にフィードバック済みかチェック
            if(this.feedbacks.has(contentId) return;
            
            // 最後のフィードバックから一定時間経過チェック
            const timeSinceLastFeedback = Date.now() - this.state.lastFeedbackTime;
            if (timeSinceLastFeedback < 60000) return; // 1分間隔
            
            // フィードバックダイアログを表示
            this.showFeedbackDialog(contentId);
            ' }'

        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to check feedback display conditions', error); }
    }
    
    /**
     * フィードバックダイアログの表示
     * @param contentId - コンテンツID
     */
    private showFeedbackDialog(contentId: string): void { try {
            if(this.feedbackDialog) {
                
            }
                this.feedbackDialog.hide(); }
            }
            
            this.currentContentId = contentId;
            this.feedbackDialog = new HelpFeedbackDialog(this.gameEngine, this);
            this.feedbackDialog.show(contentId);
            ';

            this.state.feedbacksShownThisSession++;''
            this.state.lastFeedbackTime = Date.now()';
            this.loggingSystem.debug('HelpFeedbackSystem', `Feedback dialog shown for: ${contentId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show feedback dialog', error); }
    }
    
    /**
     * クイックフィードバックの表示
     * @param contentId - コンテンツID
     * @param x - X座標
     * @param y - Y座標
     */
    showQuickFeedback(contentId: string, x: number, y: number): void { try {
            if (!this.config.enableQuickFeedback) return;
            ';

            const quickFeedback = new QuickFeedbackWidget(this.gameEngine, this);''
            quickFeedback.show(contentId, x, y);

            ' }'

            this.loggingSystem.debug('HelpFeedbackSystem', `Quick feedback shown for: ${contentId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show quick feedback', error'; }
    }
    
    /**
     * フィードバックの送信
     * @param contentId - コンテンツID
     * @param feedbackData - フィードバックデータ'
     */''
    async submitFeedback(contentId: string, feedbackData: FeedbackSubmissionData): Promise<FeedbackSubmissionResult> { try {
            const feedback: FeedbackData = {
                contentId: contentId,
                rating: feedbackData.rating,
                comment: feedbackData.comment || '';
                helpful: feedbackData.helpful;
                categories: feedbackData.categories || [];
                timestamp: Date.now();
                sessionId: this.generateSessionId(),
    userAgent: navigator.userAgent, }

                screenSize: `${window.innerWidth}x${window.innerHeight}`,''
                language: this.gameEngine.localizationManager?.getCurrentLanguage?.() || 'ja';
            },
            
            // フィードバックを保存
            this.feedbacks.set(contentId, feedback);
            
            // オフライン対応
            if (this.config.enableOfflineStorage) { this.saveFeedbackData(); }
            
            // アナリティクスに送信
            if(this.gameEngine.helpAnalytics) { this.gameEngine.helpAnalytics.trackUserFeedback(;
                    contentId,
                    feedback.rating);
                    feedback.comment);
                    { : undefined
                        helpful: feedback.helpful,);
                        categories: feedback.categories ,}
                ), }
            }
            ;
            // 成功メッセージの表示
            this.showFeedbackThankYou()';
            this.loggingSystem.info('HelpFeedbackSystem', `Feedback submitted for: ${contentId}`}';

            return { success: true }''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to submit feedback', error);
            
            // 失敗時は保留キューに追加 }
            this.pendingFeedbacks.push({ contentId, feedbackData };)
            return { success: false, error: (error, as Error).message ,}
    }
    
    /**
     * フィードバック感謝メッセージの表示
     */
    private showFeedbackThankYou(): void { try {
            const thankYouDialog = new FeedbackThankYouDialog(this.gameEngine);
            thankYouDialog.show();
            
            // 3秒後に自動で閉じる
            setTimeout(() => {  }
                thankYouDialog.hide(); }
            }, 3000);''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show thank you message', error'; }
    }
    
    /**
     * コンテンツのフィードバック抑制
     * @param contentId - コンテンツID
     */'
    suppressFeedbackForContent(contentId: string): void { ''
        this.state.suppressedContent.add(contentId);' }'

        this.loggingSystem.debug('HelpFeedbackSystem', `Feedback suppressed for: ${contentId}`});
    }

    /**
     * トピック終了を記録
     * @param topicId - 終了したトピックのID
     * @param content - トピックのコンテンツ情報
     */
    recordTopicExit(topicId: string, content?: Record<string, any>): void { try {
            // コンテンツ表示を終了
            this.endContentView(topicId);
            ';

            // 終了ログ記録' }'

            this.loggingSystem.debug('HelpFeedbackSystem', `Topic exit recorded: ${topicId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record topic exit', error); }
    }

    /**
     * トピック表示を記録
     * @param topicId - 表示されたトピックのID
     * @param content - トピックのコンテンツ情報
     */
    recordTopicView(topicId: string, content?: Record<string, any>): void { try {
            // コンテンツ表示を開始
            this.startContentView(topicId, content);
            ';

            // 表示ログ記録' }'

            this.loggingSystem.debug('HelpFeedbackSystem', `Topic view recorded: ${topicId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record topic view', error); }
    }

    /**
     * フィードバックを記録
     * @param topicId - フィードバック対象のトピックID
     * @param content - トピックのコンテンツ情報
     * @param feedback - フィードバック内容
     */
    recordFeedback(topicId: string, content: Record<string, any>, feedback: FeedbackSubmissionData): void { try {
            // フィードバック内容を統計に反映
            if(!this.state.feedbackData.has(topicId) {
                this.state.feedbackData.set(topicId, {)
                    ratings: []),
    comments: [], }
                    totalFeedbacks: 0); 
    }
            
            const feedbackStats = this.state.feedbackData.get(topicId)!;
            
            if (feedback.rating) { feedbackStats.ratings.push(feedback.rating); }
            
            if (feedback.comment) { feedbackStats.comments.push(feedback.comment); }
            
            feedbackStats.totalFeedbacks++;
            // データ保存
            this.saveFeedbackData()';
            this.loggingSystem.debug('HelpFeedbackSystem', `Feedback recorded: ${topicId}`}';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record feedback', error); }
    }
    
    /**
     * フィードバック統計の取得
     * @returns フィードバック統計
     */
    getFeedbackStatistics(): FeedbackAnalytics { try {
            const stats: FeedbackAnalytics = {
                totalFeedbacks: this.feedbacks.size,
    averageRating: 0, }
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 ,},
                helpfulPercentage: 0,
    commonCategories: new Map<string, number>(),
                topRatedContent: [],
    lowRatedContent: [];
            },
            
            let totalRating = 0;
            let helpfulCount = 0;
            const contentRatings = new Map<string, number>();
            
            for(const [contentId, feedback] of this.feedbacks.entries() {
            
                // 評価統計
                if (feedback.rating) {
                    totalRating += feedback.rating;
                    stats.ratingDistribution[feedback.rating]++;
            
            }
                    contentRatings.set(contentId, feedback.rating); }
                }
                
                // 有用性統計
                if (feedback.helpful === true) { helpfulCount++; }
                
                // カテゴリ統計
                if(feedback.categories) {
                    feedback.categories.forEach(category => { );
                }
                        const count = stats.commonCategories.get(category) || 0; }
                        stats.commonCategories.set(category, count + 1); }
                    }
            }
            
            // 平均評価の計算
            if(this.feedbacks.size > 0) {
                stats.averageRating = totalRating / this.feedbacks.size;
            }
                stats.helpfulPercentage = (helpfulCount / this.feedbacks.size) * 100; }
            }
            
            // 高評価・低評価コンテンツの抽出
            const sortedContent = Array.from(contentRatings.entries();
                .sort((a, b) => b[1] - a[1]);
            
            stats.topRatedContent = sortedContent.slice(0, 5);
            stats.lowRatedContent = sortedContent.slice(-5).reverse();
            
            return stats;

        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to generate feedback statistics', error);
            return { totalFeedbacks: 0, };
                averageRating: 0, }
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 ,},
                helpfulPercentage: 0;
                commonCategories: new Map();
                topRatedContent: [],
    lowRatedContent: [];
            },
        }
    }
    
    /**
     * フィードバックデータの保存
     */
    private saveFeedbackData(): void { try {
            const dataToSave: SavedFeedbackData = {
                feedbacks: Array.from(this.feedbacks.entries();
                pendingFeedbacks: this.pendingFeedbacks,
    state: {
                    feedbacksShownThisSession: this.state.feedbacksShownThisSession;
                    suppressedContent: Array.from(this.state.suppressedContent);
                    contentViewTimes: Array.from(this.state.contentViewTimes.entries();
                    viewStartTimes: Array.from(this.state.viewStartTimes.entries();
                    lastFeedbackTime: this.state.lastFeedbackTime,
    feedbackData: Array.from(this.state.feedbackData.entries( 
    },''
                lastSaved: Date.now()';
            localStorage.setItem('help_feedback_data', JSON.stringify(dataToSave));''
            this.loggingSystem.debug('HelpFeedbackSystem', 'Feedback data saved';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to save feedback data', error'; }
    }
    
    /**
     * フィードバックデータの読み込み'
     */''
    private loadFeedbackData()';
            const savedData = localStorage.getItem('help_feedback_data);
            if (!savedData) return;
            
            const data: SavedFeedbackData = JSON.parse(savedData),
            
            // フィードバックデータの復元
            if (data.feedbacks) { this.feedbacks = new Map(data.feedbacks); }
            
            if (data.pendingFeedbacks) { this.pendingFeedbacks = data.pendingFeedbacks; }
            
            if(data.state) {
            
                this.state = {
                    feedbacksShownThisSession: data.state.feedbacksShownThisSession || 0;
                    suppressedContent: new Set(data.state.suppressedContent || []);
                    contentViewTimes: new Map(data.state.contentViewTimes || []);
                    viewStartTimes: new Map(data.state.viewStartTimes || []),
    lastFeedbackTime: data.state.lastFeedbackTime || 0;
            }

                    feedbackData: new Map(data.state.feedbackData || []); 
    }

            this.loggingSystem.debug('HelpFeedbackSystem', 'Feedback data loaded';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to load feedback data', error'; }
    }
    
    /**
     * イベントリスナーの設定'
     */''
    private setupEventListeners()';
        window.addEventListener('beforeunload', () => { this.saveFeedbackData(); }
    
    /**
     * セッションIDの生成'
     */''
    private generateSessionId()';
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 設定の取得
     * @returns 現在の設定
     */
    getConfig(): FeedbackConfig {
        return { ...this.config;
    }
    
    /**
     * 設定の更新
     * @param newConfig - 新しい設定'
     */''
    updateConfig(newConfig: Partial<FeedbackConfig>): void {'
        this.config = { ...this.config, ...newConfig;''
        this.loggingSystem.debug('HelpFeedbackSystem', 'Config updated);
    }
    
    /**
     * 保留中のフィードバックを取得
     * @returns 保留中のフィードバック配列
     */
    getPendingFeedbacks(): PendingFeedback[] { return [...this.pendingFeedbacks];
    
    /**
     * セッション統計を取得
     * @returns セッション統計
     */
    getSessionStats(): Record<string, any> { return { feedbacksShownThisSession: this.state.feedbacksShownThisSession,
            suppressedContentCount: this.state.suppressedContent.size;
            activeViewsCount: this.state.viewStartTimes.size,
    totalViewTime: Array.from(this.state.contentViewTimes.values().reduce((sum, time) => sum + time, 0), };
            lastFeedbackTime: this.state.lastFeedbackTime 
    }
    
    /**
     * コンテンツビュー時間を取得
     * @param contentId - コンテンツID
     * @returns ビュー時間（ミリ秒）
     */
    getContentViewTime(contentId: string): number { return this.state.contentViewTimes.get(contentId) || 0; }
    
    /**
     * 特定コンテンツのフィードバックを取得
     * @param contentId - コンテンツID
     * @returns フィードバックデータ
     */
    getContentFeedback(contentId: string): FeedbackData | null { return this.feedbacks.get(contentId) || null; }
    
    /**
     * フィードバック統計をリセット
     */'
    resetStatistics(): void { ''
        this.state.feedbackData.clear()';
        this.loggingSystem.debug('HelpFeedbackSystem', 'Statistics reset); }
    
    /**
     * セッション状態をリセット
     */
    resetSession(): void { this.state.feedbacksShownThisSession = 0;

        this.state.lastFeedbackTime = 0;''
        this.state.viewStartTimes.clear()';
        this.loggingSystem.debug('HelpFeedbackSystem', 'Session reset); }
    
    /**
     * クリーンアップ処理
     */
    cleanup(): void { try {
            if(this.feedbackDialog) {
                this.feedbackDialog.hide();
            }
                this.feedbackDialog = null; }
            }

            this.saveFeedbackData()';
            this.loggingSystem.info('HelpFeedbackSystem', 'Help feedback system cleaned up';''
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to cleanup feedback system', error); }
}

/**
 * フィードバックダイアログクラス
 */
class HelpFeedbackDialog extends ScenesBaseDialog { private feedbackSystem: HelpFeedbackSystem
    private contentId: string | null;
    private rating: number;
    private helpful: boolean | null;
    private comment: string;
    private, categories: string[];
    constructor(gameEngine: GameEngine, feedbackSystem: HelpFeedbackSystem) {
';

        super(gameEngine);
        this.feedbackSystem = feedbackSystem;
        this.contentId = null;
        this.rating = 0;

        this.helpful = null;''
        this.comment = '';

    ,}
        this.categories = []; }
    }
    
    /**
     * フィードバックダイアログの表示
     * @param contentId - コンテンツID
     */
    show(contentId: string): void { this.contentId = contentId;
        
        const t = this.gameEngine.localizationManager?.t?.bind(this.gameEngine.localizationManager) || ((key: string, defaultValue: string) => defaultValue);

        this.showDialog({);''
            title: t('help.feedback.title', 'このヘルプは役に立ちましたか？''),
            content: this.buildFeedbackContent()',
    buttons: [{')'
                    text: t('help.feedback.submit', '送信',
                    action: () => this.submitFeedback(;
                    isPrimary: true ,}))'
                { ')'
                    text: t('help.feedback.skip', 'スキップ),
                    action: () => this.skipFeedback()';
                    text: t('common.cancel', 'キャンセル),
                    action: () => this.hide() ,}]
                }]
            ];
        }
    
    /**
     * フィードバックコンテンツの構築
     */'
    private buildFeedbackContent(): string { ''
        const t = this.gameEngine.localizationManager?.t?.bind(this.gameEngine.localizationManager) || ((key: string, defaultValue: string) => defaultValue');
        ';

        return `'';
            <div class="feedback-content">"";
                <div class="rating-section">" ,}"
                    <label>${t('help.feedback.rating', '評価:''}'</label>''
                    <div class="star-rating">"";
                        ${ [1, 2, 3, 4, 5].map(star => "}""
                            `<span, class="star" data-rating="${star"}">★</span>`" }"
                        ").join('''}'
                    </div>;
                </div>';

                <div class="helpful-section">"";
                    <label>${t('help.feedback.helpful', 'このヘルプは問題解決に役立ちましたか？''}'</label>''
                    <div class="helpful-buttons">"";
                        <button type="button" class="helpful-btn" data-helpful="true">"";
                            ${t('help.feedback.yes', 'はい''}''
                        </button>'';
                        <button type="button" class="helpful-btn" data-helpful="false">"";
                            ${t('help.feedback.no', 'いいえ''}'
                        </button>;
                    </div>;
                </div>';

                <div class="comment-section">"";
                    <label>${t('help.feedback.comment', 'コメント（任意）:''}'</label>''
                    <textarea class="feedback-comment" rows="3", "";
                        placeholder="${t('help.feedback.commentPlaceholder', '改善点や要望があればお聞かせください''}'"></textarea>
                </div>";

                <div class="categories-section">"";
                    <label>${t('help.feedback.categories', '該当する項目:''}'</label>''
                    <div class="category-checkboxes">"";
                        <label><input type="checkbox" value="clear"> ${t('help.feedback.clear', '分かりやすい''}'</label>''
                        <label><input type="checkbox" value="complete"> ${t('help.feedback.complete', '情報が十分''}'</label>''
                        <label><input type="checkbox" value="accurate"> ${t('help.feedback.accurate', '正確''}'</label>''
                        <label><input type="checkbox" value="outdated"> ${t('help.feedback.outdated', '情報が古い''}'</label>''
                        <label><input type="checkbox" value="confusing"> ${t('help.feedback.confusing', '分かりにくい''}'</label>''
                        <label><input type="checkbox" value="missing"> ${t('help.feedback.missing', '情報不足'})</label>
                    </div>;
                </div>;
            </div>;
        `;
    }
    
    /**
     * ダイアログ表示後の処理
     */
    onDialogShown(): void { this.setupFeedbackEventListeners(); }
    
    /**
     * フィードバック用イベントリスナーの設定
     */'
    private setupFeedbackEventListeners(): void { const dialog = this.dialogElement;''
        if(!dialog) return;
        ';
        // 星評価
        dialog.querySelectorAll('.star'.forEach(star => { ');''
            star.addEventListener('click', (e) => {'
                const target = e.target as HTMLElement;''
                this.rating = parseInt(target.dataset.rating || '0';''
                this.updateStarDisplay()';
            star.addEventListener('mouseover', (e) => {'
                const target = e.target as HTMLElement;' }'

                this.highlightStars(parseInt(target.dataset.rating || '0)'; }'
            };

        const starRating = dialog.querySelector('.star-rating';''
        if(starRating) {'

            starRating.addEventListener('mouseleave', () => { ''
                this.updateStarDisplay()';
        dialog.querySelectorAll('.helpful-btn).forEach(btn => {);''
            btn.addEventListener('click', (e) => {'
                const target = e.target as HTMLElement;''
                this.helpful = target.dataset.helpful === 'true';
                this.updateHelpfulDisplay()';
        const commentTextarea = dialog.querySelector('.feedback-comment' as HTMLTextAreaElement;''
        if(commentTextarea) {''
            commentTextarea.addEventListener('input', (e) => {
        }
                const target = e.target as HTMLTextAreaElement; }
                this.comment = target.value; }
            }
        ';
        // カテゴリチェックボックス
        dialog.querySelectorAll('.category-checkboxes, input'.forEach(checkbox => {  ');''
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.checked) { }
                    this.categories.push(target.value); }
                } else { this.categories = this.categories.filter(cat => cat !== target.value); }
};
    }
    
    /**
     * 星の表示更新
     */'
    private updateStarDisplay(): void { ''
        if(!this.dialogElement) return;

        const stars = this.dialogElement.querySelectorAll('.star';''
        stars.forEach((star, index) => { ' }'

            star.classList.toggle('selected', index < this.rating'; }
        }
    
    /**
     * 星のハイライト
     */'
    private highlightStars(rating: number): void { ''
        if(!this.dialogElement) return;

        const stars = this.dialogElement.querySelectorAll('.star';''
        stars.forEach((star, index) => { ' }'

            star.classList.toggle('highlight', index < rating'; }
        }
    
    /**
     * 有用性ボタンの表示更新
     */'
    private updateHelpfulDisplay(): void { ''
        if(!this.dialogElement) return;

        const buttons = this.dialogElement.querySelectorAll('.helpful-btn);
        buttons.forEach(btn => { )'
            const target = btn as HTMLElement';''
            const isSelected = target.dataset.helpful === this.helpful?.toString() }

            target.classList.toggle('selected', isSelected); }
        }
    
    /**
     * フィードバックの送信
     */ : undefined
    private async submitFeedback(): Promise<void> { try {
            if (!this.contentId) return;
            
            const feedbackData: FeedbackSubmissionData = {
                rating: this.rating;
                helpful: this.helpful || undefined;
                comment: this.comment.trim(,
    categories: this.categories }))
            );
            const result = await this.feedbackSystem.submitFeedback(this.contentId, feedbackData);
            
            if(result.success) {
            ';

                this.hide();
            }

                this.showError('フィードバックの送信に失敗しました。';' }

            } catch (error) {
            this.showError('フィードバックの送信中にエラーが発生しました。'; }'
    }
    
    /**
     * フィードバックのスキップ
     */
    private skipFeedback(): void { if (this.contentId) {
            this.feedbackSystem.suppressFeedbackForContent(this.contentId); }
        this.hide();
    }
}

/**
 * クイックフィードバックウィジェット
 */
class QuickFeedbackWidget { private gameEngine: GameEngine
    private feedbackSystem: HelpFeedbackSystem;
    private, element: HTMLElement | null;
    constructor(gameEngine: GameEngine, feedbackSystem: HelpFeedbackSystem) {

        this.gameEngine = gameEngine;
        this.feedbackSystem = feedbackSystem;

    ,}
        this.element = null; }
    }
    
    /**
     * クイックフィードバックの表示
     * @param contentId - コンテンツID
     * @param x - X座標
     * @param y - Y座標
     */
    show(contentId: string, x: number, y: number): void { this.hide(); // 既存のウィジェットを閉じる

        const t = this.gameEngine.localizationManager?.t?.bind(this.gameEngine.localizationManager) || ((key: string, defaultValue: string) => defaultValue');

        this.element = document.createElement('div'');''
        this.element.className = 'quick-feedback-widget';
        this.element.style.cssText = `;
            position: fixed ,}
            left: ${x}px;
            top: ${y}px;
            background: white,
    border: 1px solid #ccc;
            border-radius: 8px,
            padding: 12px,
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001,
            font-size: 14px,
            min-width: 200px,
        `;
        ';

        this.element.innerHTML = `'';
            <div class="quick-feedback-header">"";
                ${t('help.feedback.quick', 'このヘルプは役に立ちましたか？''}''
            </div>'';
            <div class="quick-feedback-buttons">"";
                <button class="quick-btn helpful" data-helpful="true">"";
                    👍 ${t('help.feedback.helpful', '役に立った''}''
                </button>'';
                <button class="quick-btn not-helpful" data-helpful="false">"";
                    👎 ${t('help.feedback.notHelpful', '役に立たなかった''}'
                </button>';
            </div>'';
            <button class="close-btn">×</button>;
        `;"

        document.body.appendChild(this.element);
        ";
        // イベントリスナーの設定""
        this.element.querySelectorAll('.quick-btn'.forEach(btn => {  ');''
            btn.addEventListener('click', (e) => {'
                const target = e.target as HTMLElement;''
                const helpful = target.dataset.helpful === 'true';' }

                this.submitQuickFeedback(contentId, helpful); }
            };

        const closeBtn = this.element.querySelector('.close-btn';''
        if(closeBtn) {', ';

        }

            closeBtn.addEventListener('click', () => {  }
                this.hide(); }
            }
        
        // 10秒後に自動で閉じる
        setTimeout(() => { this.hide(); }, 10000);
    }
    
    /**
     * クイックフィードバックの送信
     * @param contentId - コンテンツID
     * @param helpful - 有用性
     */''
    private async submitQuickFeedback(contentId: string, helpful: boolean): Promise<void> { try {
            await this.feedbackSystem.submitFeedback(contentId, {)
                helpful: helpful)',
    rating: helpful ? 4 : 2, // 簡易評価;
                comment: '',);
                categories: []);
            ;

            this.hide();' ,}'

        } catch (error) {
            console.error('Failed to submit quick feedback:', error);
            this.hide(); }
    }
    
    /**
     * ウィジェットを隠す
     */
    hide(): void { if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null; }
}

/**
 * フィードバック感謝ダイアログ
 */
class FeedbackThankYouDialog extends ScenesBaseDialog { constructor(gameEngine: GameEngine) {
        super(gameEngine }
    
    /**
     * 感謝ダイアログの表示
     */
    show(): void { const t = this.gameEngine.localizationManager?.t?.bind(this.gameEngine.localizationManager) || ((key: string, defaultValue: string) => defaultValue);

        this.showDialog({);''
            title: t('help.feedback.thankYou', 'ありがとうございました''),
            content: `'';
                <div class="thank-you-content">"";
                    <div class="thank-you-icon">✨</div>" ,}"
                    <p>${t('help.feedback.thankYouMessage', 'フィードバックをお送りいただき、ありがとうございます。''}'</p>''
                    <p>${t('help.feedback.improvement', 'いただいたご意見は、サービス改善に活用させていただきます。''}'</p>
                </div>;
            `,
            buttons: [{ ''
                    text: t('common.ok', 'OK),
                    action: () => this.hide(;
                    isPrimary: true ,}]
                }]
            ];
        },
    }
}

// シングルトンインスタンス管理)
let helpFeedbackSystemInstance: HelpFeedbackSystem | null = null);
/**
 * HelpFeedbackSystemのシングルトンインスタンスを取得
 * @param gameEngine - ゲームエンジンインスタンス
 * @returns HelpFeedbackSystemインスタンス
 */)
export function getHelpFeedbackSystem(gameEngine: GameEngine): HelpFeedbackSystem | null { if (!helpFeedbackSystemInstance && gameEngine) {
        helpFeedbackSystemInstance = new HelpFeedbackSystem(gameEngine); }
    return helpFeedbackSystemInstance;
}

/**
 * HelpFeedbackSystemインスタンスを再初期化
 * @param gameEngine - ゲームエンジンインスタンス
 * @returns 新しいHelpFeedbackSystemインスタンス
 */
export function reinitializeHelpFeedbackSystem(gameEngine: GameEngine): HelpFeedbackSystem | null { if (helpFeedbackSystemInstance) {
        helpFeedbackSystemInstance.cleanup(); }''
    helpFeedbackSystemInstance = gameEngine ? new HelpFeedbackSystem(gameEngine) : null;

    return helpFeedbackSystemInstance;''
}