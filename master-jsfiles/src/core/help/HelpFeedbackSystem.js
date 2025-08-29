import { LoggingSystem } from '../LoggingSystem.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { ScenesBaseDialog } from '../../scenes/components/ScenesBaseDialog.js';

/**
 * ヘルプコンテンツに対するフィードバック収集システム
 */
export class HelpFeedbackSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.loggingSystem = LoggingSystem.getInstance ? LoggingSystem.getInstance() : new LoggingSystem();
        
        // フィードバックダイアログ
        this.feedbackDialog = null;
        this.currentContentId = null;
        
        // フィードバックデータ
        this.feedbacks = new Map();
        this.pendingFeedbacks = [];
        
        // 設定
        this.config = {
            enableRatingPrompts: true,
            enableTextFeedback: true,
            enableQuickFeedback: true,
            showAfterViewTime: 30000, // 30秒後に表示
            maxFeedbacksPerSession: 3,
            enableOfflineStorage: true,
            submitRetryAttempts: 3
        };
        
        // フィードバック状態
        this.state = {
            feedbacksShownThisSession: 0,
            contentViewTimes: new Map(),
            viewStartTimes: new Map(),
            suppressedContent: new Set(),
            lastFeedbackTime: 0,
            feedbackData: new Map()
        };
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    initialize() {
        try {
            // 保存されたフィードバックデータの読み込み
            this.loadFeedbackData();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.loggingSystem.info('HelpFeedbackSystem', 'Help feedback system initialized');
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to initialize feedback system', error);
            ErrorHandler.handle(error, 'HelpFeedbackSystem.initialize');
        }
    }
    
    /**
     * コンテンツ表示の開始を追跡
     * @param {string} contentId - コンテンツID
     * @param {Object} contentData - コンテンツデータ
     */
    startContentView(contentId, contentData = {}) {
        try {
            const now = Date.now();
            this.state.viewStartTimes.set(contentId, now);
            
            // 既存のビュータイムがある場合は累積
            const existingTime = this.state.contentViewTimes.get(contentId) || 0;
            this.state.contentViewTimes.set(contentId, existingTime);
            
            this.loggingSystem.debug('HelpFeedbackSystem', `Content view started: ${contentId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to start content view tracking', error);
        }
    }
    
    /**
     * コンテンツ表示の終了を追跡
     * @param {string} contentId - コンテンツID
     */
    endContentView(contentId) {
        try {
            const startTime = this.state.viewStartTimes.get(contentId);
            if (!startTime) return;
            
            const viewDuration = Date.now() - startTime;
            const existingTime = this.state.contentViewTimes.get(contentId) || 0;
            const totalViewTime = existingTime + viewDuration;
            
            this.state.contentViewTimes.set(contentId, totalViewTime);
            this.state.viewStartTimes.delete(contentId);
            
            // フィードバック表示の判定
            this.checkShouldShowFeedback(contentId, totalViewTime);
            
            this.loggingSystem.debug('HelpFeedbackSystem', `Content view ended: ${contentId}, duration: ${viewDuration}ms`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to end content view tracking', error);
        }
    }
    
    /**
     * フィードバック表示の判定
     * @param {string} contentId - コンテンツID
     * @param {number} viewTime - 表示時間
     */
    checkShouldShowFeedback(contentId, viewTime) {
        try {
            // 表示条件のチェック
            if (!this.config.enableRatingPrompts) return;
            if (this.state.feedbacksShownThisSession >= this.config.maxFeedbacksPerSession) return;
            if (this.state.suppressedContent.has(contentId)) return;
            if (viewTime < this.config.showAfterViewTime) return;
            
            // 既にフィードバック済みかチェック
            if (this.feedbacks.has(contentId)) return;
            
            // 最後のフィードバックから一定時間経過チェック
            const timeSinceLastFeedback = Date.now() - this.state.lastFeedbackTime;
            if (timeSinceLastFeedback < 60000) return; // 1分間隔
            
            // フィードバックダイアログを表示
            this.showFeedbackDialog(contentId);
            
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to check feedback display conditions', error);
        }
    }
    
    /**
     * フィードバックダイアログの表示
     * @param {string} contentId - コンテンツID
     */
    showFeedbackDialog(contentId) {
        try {
            if (this.feedbackDialog) {
                this.feedbackDialog.hide();
            }
            
            this.currentContentId = contentId;
            this.feedbackDialog = new HelpFeedbackDialog(this.gameEngine, this);
            this.feedbackDialog.show(contentId);
            
            this.state.feedbacksShownThisSession++;
            this.state.lastFeedbackTime = Date.now();
            
            this.loggingSystem.debug('HelpFeedbackSystem', `Feedback dialog shown for: ${contentId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show feedback dialog', error);
        }
    }
    
    /**
     * クイックフィードバックの表示
     * @param {string} contentId - コンテンツID
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    showQuickFeedback(contentId, x, y) {
        try {
            if (!this.config.enableQuickFeedback) return;
            
            const quickFeedback = new QuickFeedbackWidget(this.gameEngine, this);
            quickFeedback.show(contentId, x, y);
            
            this.loggingSystem.debug('HelpFeedbackSystem', `Quick feedback shown for: ${contentId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show quick feedback', error);
        }
    }
    
    /**
     * フィードバックの送信
     * @param {string} contentId - コンテンツID
     * @param {Object} feedbackData - フィードバックデータ
     */
    async submitFeedback(contentId, feedbackData) {
        try {
            const feedback = {
                contentId: contentId,
                rating: feedbackData.rating,
                comment: feedbackData.comment || '',
                helpful: feedbackData.helpful,
                categories: feedbackData.categories || [],
                timestamp: Date.now(),
                sessionId: this.generateSessionId(),
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: this.gameEngine.localizationManager?.getCurrentLanguage() || 'ja'
            };
            
            // フィードバックを保存
            this.feedbacks.set(contentId, feedback);
            
            // オフライン対応
            if (this.config.enableOfflineStorage) {
                this.saveFeedbackData();
            }
            
            // アナリティクスに送信
            if (this.gameEngine.helpAnalytics) {
                this.gameEngine.helpAnalytics.trackUserFeedback(
                    contentId,
                    feedback.rating,
                    feedback.comment,
                    {
                        helpful: feedback.helpful,
                        categories: feedback.categories
                    }
                );
            }
            
            // 成功メッセージの表示
            this.showFeedbackThankYou();
            
            this.loggingSystem.info('HelpFeedbackSystem', `Feedback submitted for: ${contentId}`);
            return { success: true };
            
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to submit feedback', error);
            
            // 失敗時は保留キューに追加
            this.pendingFeedbacks.push({ contentId, feedbackData });
            return { success: false, error: error.message };
        }
    }
    
    /**
     * フィードバック感謝メッセージの表示
     */
    showFeedbackThankYou() {
        try {
            const thankYouDialog = new FeedbackThankYouDialog(this.gameEngine);
            thankYouDialog.show();
            
            // 3秒後に自動で閉じる
            setTimeout(() => {
                thankYouDialog.hide();
            }, 3000);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to show thank you message', error);
        }
    }
    
    /**
     * コンテンツのフィードバック抑制
     * @param {string} contentId - コンテンツID
     */
    suppressFeedbackForContent(contentId) {
        this.state.suppressedContent.add(contentId);
        this.loggingSystem.debug('HelpFeedbackSystem', `Feedback suppressed for: ${contentId}`);
    }

    /**
     * トピック終了を記録
     * @param {string} topicId - 終了したトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     */
    recordTopicExit(topicId, content) {
        try {
            // コンテンツ表示を終了
            this.endContentView(topicId);
            
            // 終了ログ記録
            this.loggingSystem.debug('HelpFeedbackSystem', `Topic exit recorded: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record topic exit', error);
        }
    }

    /**
     * トピック表示を記録
     * @param {string} topicId - 表示されたトピックのID
     * @param {Object} content - トピックのコンテンツ情報
     */
    recordTopicView(topicId, content) {
        try {
            // コンテンツ表示を開始
            this.startContentView(topicId);
            
            // 表示ログ記録
            this.loggingSystem.debug('HelpFeedbackSystem', `Topic view recorded: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record topic view', error);
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
            // フィードバック内容を統計に反映
            if (!this.state.feedbackData.has(topicId)) {
                this.state.feedbackData.set(topicId, {
                    ratings: [],
                    comments: [],
                    totalFeedbacks: 0
                });
            }
            
            const feedbackStats = this.state.feedbackData.get(topicId);
            
            if (feedback.rating) {
                feedbackStats.ratings.push(feedback.rating);
            }
            
            if (feedback.comment) {
                feedbackStats.comments.push(feedback.comment);
            }
            
            feedbackStats.totalFeedbacks++;
            
            // データ保存
            this.saveFeedbackData();
            
            this.loggingSystem.debug('HelpFeedbackSystem', `Feedback recorded: ${topicId}`);
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to record feedback', error);
        }
    }
    
    /**
     * フィードバック統計の取得
     * @returns {Object} フィードバック統計
     */
    getFeedbackStatistics() {
        try {
            const stats = {
                totalFeedbacks: this.feedbacks.size,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                helpfulPercentage: 0,
                commonCategories: new Map(),
                topRatedContent: [],
                lowRatedContent: []
            };
            
            let totalRating = 0;
            let helpfulCount = 0;
            const contentRatings = new Map();
            
            for (const [contentId, feedback] of this.feedbacks.entries()) {
                // 評価統計
                if (feedback.rating) {
                    totalRating += feedback.rating;
                    stats.ratingDistribution[feedback.rating]++;
                    contentRatings.set(contentId, feedback.rating);
                }
                
                // 有用性統計
                if (feedback.helpful === true) {
                    helpfulCount++;
                }
                
                // カテゴリ統計
                if (feedback.categories) {
                    feedback.categories.forEach(category => {
                        const count = stats.commonCategories.get(category) || 0;
                        stats.commonCategories.set(category, count + 1);
                    });
                }
            }
            
            // 平均評価の計算
            if (this.feedbacks.size > 0) {
                stats.averageRating = totalRating / this.feedbacks.size;
                stats.helpfulPercentage = (helpfulCount / this.feedbacks.size) * 100;
            }
            
            // 高評価・低評価コンテンツの抽出
            const sortedContent = Array.from(contentRatings.entries())
                .sort((a, b) => b[1] - a[1]);
            
            stats.topRatedContent = sortedContent.slice(0, 5);
            stats.lowRatedContent = sortedContent.slice(-5).reverse();
            
            return stats;
            
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to generate feedback statistics', error);
            return {};
        }
    }
    
    /**
     * フィードバックデータの保存
     */
    saveFeedbackData() {
        try {
            const dataToSave = {
                feedbacks: Array.from(this.feedbacks.entries()),
                pendingFeedbacks: this.pendingFeedbacks,
                state: {
                    ...this.state,
                    suppressedContent: Array.from(this.state.suppressedContent),
                    contentViewTimes: Array.from(this.state.contentViewTimes.entries()),
                    viewStartTimes: Array.from(this.state.viewStartTimes.entries())
                },
                lastSaved: Date.now()
            };
            
            localStorage.setItem('help_feedback_data', JSON.stringify(dataToSave));
            this.loggingSystem.debug('HelpFeedbackSystem', 'Feedback data saved');
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to save feedback data', error);
        }
    }
    
    /**
     * フィードバックデータの読み込み
     */
    loadFeedbackData() {
        try {
            const savedData = localStorage.getItem('help_feedback_data');
            if (!savedData) return;
            
            const data = JSON.parse(savedData);
            
            // フィードバックデータの復元
            if (data.feedbacks) {
                this.feedbacks = new Map(data.feedbacks);
            }
            
            if (data.pendingFeedbacks) {
                this.pendingFeedbacks = data.pendingFeedbacks;
            }
            
            if (data.state) {
                this.state = {
                    ...this.state,
                    ...data.state,
                    suppressedContent: new Set(data.state.suppressedContent || []),
                    contentViewTimes: new Map(data.state.contentViewTimes || []),
                    viewStartTimes: new Map(data.state.viewStartTimes || [])
                };
            }
            
            this.loggingSystem.debug('HelpFeedbackSystem', 'Feedback data loaded');
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to load feedback data', error);
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ページ離脱時の処理
        window.addEventListener('beforeunload', () => {
            this.saveFeedbackData();
        });
    }
    
    /**
     * セッションIDの生成
     */
    generateSessionId() {
        return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * クリーンアップ処理
     */
    cleanup() {
        try {
            if (this.feedbackDialog) {
                this.feedbackDialog.hide();
                this.feedbackDialog = null;
            }
            
            this.saveFeedbackData();
            this.loggingSystem.info('HelpFeedbackSystem', 'Help feedback system cleaned up');
        } catch (error) {
            this.loggingSystem.error('HelpFeedbackSystem', 'Failed to cleanup feedback system', error);
        }
    }
}

/**
 * フィードバックダイアログクラス
 */
class HelpFeedbackDialog extends ScenesBaseDialog {
    constructor(gameEngine, feedbackSystem) {
        super(gameEngine);
        this.feedbackSystem = feedbackSystem;
        this.contentId = null;
        this.rating = 0;
        this.helpful = null;
        this.comment = '';
        this.categories = [];
    }
    
    /**
     * フィードバックダイアログの表示
     * @param {string} contentId - コンテンツID
     */
    show(contentId) {
        this.contentId = contentId;
        
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        this.showDialog({
            title: t('help.feedback.title', 'このヘルプは役に立ちましたか？'),
            content: this.buildFeedbackContent(),
            buttons: [
                {
                    text: t('help.feedback.submit', '送信'),
                    action: () => this.submitFeedback(),
                    isPrimary: true
                },
                {
                    text: t('help.feedback.skip', 'スキップ'),
                    action: () => this.skipFeedback()
                },
                {
                    text: t('common.cancel', 'キャンセル'),
                    action: () => this.hide()
                }
            ]
        });
    }
    
    /**
     * フィードバックコンテンツの構築
     */
    buildFeedbackContent() {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        return `
            <div class="feedback-content">
                <div class="rating-section">
                    <label>${t('help.feedback.rating', '評価:')}</label>
                    <div class="star-rating">
                        ${[1, 2, 3, 4, 5].map(star => 
                            `<span class="star" data-rating="${star}">★</span>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="helpful-section">
                    <label>${t('help.feedback.helpful', 'このヘルプは問題解決に役立ちましたか？')}</label>
                    <div class="helpful-buttons">
                        <button type="button" class="helpful-btn" data-helpful="true">
                            ${t('help.feedback.yes', 'はい')}
                        </button>
                        <button type="button" class="helpful-btn" data-helpful="false">
                            ${t('help.feedback.no', 'いいえ')}
                        </button>
                    </div>
                </div>
                
                <div class="comment-section">
                    <label>${t('help.feedback.comment', 'コメント（任意）:')}</label>
                    <textarea class="feedback-comment" rows="3" 
                        placeholder="${t('help.feedback.commentPlaceholder', '改善点や要望があればお聞かせください')}"></textarea>
                </div>
                
                <div class="categories-section">
                    <label>${t('help.feedback.categories', '該当する項目:')}</label>
                    <div class="category-checkboxes">
                        <label><input type="checkbox" value="clear"> ${t('help.feedback.clear', '分かりやすい')}</label>
                        <label><input type="checkbox" value="complete"> ${t('help.feedback.complete', '情報が十分')}</label>
                        <label><input type="checkbox" value="accurate"> ${t('help.feedback.accurate', '正確')}</label>
                        <label><input type="checkbox" value="outdated"> ${t('help.feedback.outdated', '情報が古い')}</label>
                        <label><input type="checkbox" value="confusing"> ${t('help.feedback.confusing', '分かりにくい')}</label>
                        <label><input type="checkbox" value="missing"> ${t('help.feedback.missing', '情報不足')}</label>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * ダイアログ表示後の処理
     */
    onDialogShown() {
        this.setupFeedbackEventListeners();
    }
    
    /**
     * フィードバック用イベントリスナーの設定
     */
    setupFeedbackEventListeners() {
        const dialog = this.dialogElement;
        
        // 星評価
        dialog.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.rating = parseInt(e.target.dataset.rating);
                this.updateStarDisplay();
            });
            
            star.addEventListener('mouseover', (e) => {
                this.highlightStars(parseInt(e.target.dataset.rating));
            });
        });
        
        dialog.querySelector('.star-rating').addEventListener('mouseleave', () => {
            this.updateStarDisplay();
        });
        
        // 有用性ボタン
        dialog.querySelectorAll('.helpful-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.helpful = e.target.dataset.helpful === 'true';
                this.updateHelpfulDisplay();
            });
        });
        
        // コメント
        const commentTextarea = dialog.querySelector('.feedback-comment');
        commentTextarea.addEventListener('input', (e) => {
            this.comment = e.target.value;
        });
        
        // カテゴリチェックボックス
        dialog.querySelectorAll('.category-checkboxes input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.categories.push(e.target.value);
                } else {
                    this.categories = this.categories.filter(cat => cat !== e.target.value);
                }
            });
        });
    }
    
    /**
     * 星の表示更新
     */
    updateStarDisplay() {
        const stars = this.dialogElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('selected', index < this.rating);
        });
    }
    
    /**
     * 星のハイライト
     */
    highlightStars(rating) {
        const stars = this.dialogElement.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('highlight', index < rating);
        });
    }
    
    /**
     * 有用性ボタンの表示更新
     */
    updateHelpfulDisplay() {
        const buttons = this.dialogElement.querySelectorAll('.helpful-btn');
        buttons.forEach(btn => {
            const isSelected = btn.dataset.helpful === this.helpful.toString();
            btn.classList.toggle('selected', isSelected);
        });
    }
    
    /**
     * フィードバックの送信
     */
    async submitFeedback() {
        try {
            const feedbackData = {
                rating: this.rating,
                helpful: this.helpful,
                comment: this.comment.trim(),
                categories: this.categories
            };
            
            const result = await this.feedbackSystem.submitFeedback(this.contentId, feedbackData);
            
            if (result.success) {
                this.hide();
            } else {
                // エラー表示
                this.showError('フィードバックの送信に失敗しました。');
            }
        } catch (error) {
            this.showError('フィードバックの送信中にエラーが発生しました。');
        }
    }
    
    /**
     * フィードバックのスキップ
     */
    skipFeedback() {
        this.feedbackSystem.suppressFeedbackForContent(this.contentId);
        this.hide();
    }
}

/**
 * クイックフィードバックウィジェット
 */
class QuickFeedbackWidget {
    constructor(gameEngine, feedbackSystem) {
        this.gameEngine = gameEngine;
        this.feedbackSystem = feedbackSystem;
        this.element = null;
    }
    
    /**
     * クイックフィードバックの表示
     * @param {string} contentId - コンテンツID
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    show(contentId, x, y) {
        this.hide(); // 既存のウィジェットを閉じる
        
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        this.element = document.createElement('div');
        this.element.className = 'quick-feedback-widget';
        this.element.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-size: 14px;
            min-width: 200px;
        `;
        
        this.element.innerHTML = `
            <div class="quick-feedback-header">
                ${t('help.feedback.quick', 'このヘルプは役に立ちましたか？')}
            </div>
            <div class="quick-feedback-buttons">
                <button class="quick-btn helpful" data-helpful="true">
                    👍 ${t('help.feedback.helpful', '役に立った')}
                </button>
                <button class="quick-btn not-helpful" data-helpful="false">
                    👎 ${t('help.feedback.notHelpful', '役に立たなかった')}
                </button>
            </div>
            <button class="close-btn">×</button>
        `;
        
        document.body.appendChild(this.element);
        
        // イベントリスナーの設定
        this.element.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const helpful = e.target.dataset.helpful === 'true';
                this.submitQuickFeedback(contentId, helpful);
            });
        });
        
        this.element.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        // 10秒後に自動で閉じる
        setTimeout(() => {
            this.hide();
        }, 10000);
    }
    
    /**
     * クイックフィードバックの送信
     * @param {string} contentId - コンテンツID
     * @param {boolean} helpful - 有用性
     */
    async submitQuickFeedback(contentId, helpful) {
        try {
            await this.feedbackSystem.submitFeedback(contentId, {
                helpful: helpful,
                rating: helpful ? 4 : 2, // 簡易評価
                comment: '',
                categories: []
            });
            
            this.hide();
        } catch (error) {
            console.error('Failed to submit quick feedback:', error);
            this.hide();
        }
    }
    
    /**
     * ウィジェットを隠す
     */
    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}

/**
 * フィードバック感謝ダイアログ
 */
class FeedbackThankYouDialog extends ScenesBaseDialog {
    constructor(gameEngine) {
        super(gameEngine);
    }
    
    /**
     * 感謝ダイアログの表示
     */
    show() {
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        
        this.showDialog({
            title: t('help.feedback.thankYou', 'ありがとうございました'),
            content: `
                <div class="thank-you-content">
                    <div class="thank-you-icon">✨</div>
                    <p>${t('help.feedback.thankYouMessage', 'フィードバックをお送りいただき、ありがとうございます。')}</p>
                    <p>${t('help.feedback.improvement', 'いただいたご意見は、サービス改善に活用させていただきます。')}</p>
                </div>
            `,
            buttons: [
                {
                    text: t('common.ok', 'OK'),
                    action: () => this.hide(),
                    isPrimary: true
                }
            ]
        });
    }
}

// シングルトンインスタンス管理
let helpFeedbackSystemInstance = null;

/**
 * HelpFeedbackSystemのシングルトンインスタンスを取得
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpFeedbackSystem} HelpFeedbackSystemインスタンス
 */
export function getHelpFeedbackSystem(gameEngine) {
    if (!helpFeedbackSystemInstance && gameEngine) {
        helpFeedbackSystemInstance = new HelpFeedbackSystem(gameEngine);
    }
    return helpFeedbackSystemInstance;
}

/**
 * HelpFeedbackSystemインスタンスを再初期化
 * @param {GameEngine} gameEngine - ゲームエンジンインスタンス
 * @returns {HelpFeedbackSystem} 新しいHelpFeedbackSystemインスタンス
 */
export function reinitializeHelpFeedbackSystem(gameEngine) {
    if (helpFeedbackSystemInstance) {
        helpFeedbackSystemInstance.cleanup();
    }
    helpFeedbackSystemInstance = gameEngine ? new HelpFeedbackSystem(gameEngine) : null;
    return helpFeedbackSystemInstance;
}