/**
 * ContextualHelpManager - コンテキスト対応ヘルプ管理システム
 * 
 * Main Controller Pattern実装により、専門化されたサブコンポーネントを統制します。
 * WCAG 2.1 AAガイドラインに準拠した認知アクセシビリティ機能を実装します。
 */

import { HelpContentManager } from './contextual-help-manager/HelpContentManager.js';
import { HelpDisplayController } from './contextual-help-manager/HelpDisplayController.js';
import { HelpTriggerManager } from './contextual-help-manager/HelpTriggerManager.js';
import { HelpPersonalizationEngine } from './contextual-help-manager/HelpPersonalizationEngine.js';

export class ContextualHelpManager {
    /**
     * ContextualHelpManagerを初期化
     * @param {Object} gameEngine - ゲームエンジンインスタンス
     */
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isInitialized = false;
        
        // サブコンポーネントを初期化
        this.contentManager = new HelpContentManager();
        this.displayController = new HelpDisplayController();
        this.triggerManager = new HelpTriggerManager();
        this.personalizationEngine = new HelpPersonalizationEngine();
        
        // 基本設定
        this.config = {
            enabled: true,
            autoShow: true,
            smartTiming: true,
            adaptiveContent: true,
            voiceOutput: false
        };
        
        // 状態管理
        this.state = {
            currentContext: null,
            activeHelp: null,
            helpHistory: [],
            userProgress: {
                completedTutorials: new Set(),
                viewedTopics: new Set(),
                helpRequestCount: 0,
                successfulInteractions: 0,
                errorCount: 0
            }
        };
        
        this.setupTriggerCallbacks();
    }

    /**
     * トリガーコールバックを設定
     */
    setupTriggerCallbacks() {
        this.triggerManager.onDefaultTrigger((triggerType, context) => {
            this.handleTrigger(triggerType, context);
        });
    }

    /**
     * ContextualHelpManagerを初期化
     * @param {Object} options - 初期化オプション
     */
    async initialize(options = {}) {
        if (this.isInitialized) return;
        
        try {
            // 設定をマージ
            Object.assign(this.config, options);
            
            // 表示コントローラー設定更新
            this.displayController.updateConfig(this.config.displaySettings || {});
            
            // トリガーマネージャー設定更新
            this.triggerManager.updateTriggers(this.config.triggers || {});
            
            // パーソナライゼーション設定更新
            this.personalizationEngine.updatePersonalizationConfig(this.config.learning || {});
            
            this.isInitialized = true;
            this.logEvent('initialized', { config: this.config });
            
        } catch (error) {
            console.error('ContextualHelpManager initialization failed:', error);
            throw error;
        }
    }

    /**
     * トリガーを処理
     */
    async handleTrigger(triggerType, context) {
        if (!this.config.enabled) return;
        
        try {
            const helpContent = await this.getRelevantHelp(triggerType, context);
            if (helpContent) {
                await this.showContextualHelp(helpContent, context);
            }
        } catch (error) {
            console.error('Error handling trigger:', error);
        }
    }

    /**
     * 関連ヘルプを取得
     */
    async getRelevantHelp(triggerType, context) {
        // コンテンツマネージャーからコンテンツを検索
        const searchResults = this.contentManager.searchContent(triggerType);
        if (searchResults.length === 0) return null;
        
        // 最初の結果を取得
        const baseContent = this.contentManager.getContent(searchResults[0]);
        if (!baseContent) return null;
        
        // パーソナライゼーションを適用
        if (this.config.adaptiveContent) {
            return this.personalizationEngine.getPersonalizedContent(baseContent.content, {
                triggerType,
                ...context
            });
        }
        
        return baseContent.content;
    }

    /**
     * コンテキストヘルプを表示
     */
    async showContextualHelp(content, context = {}) {
        this.state.activeHelp = { content, context };
        this.state.helpHistory.push({ content, context, timestamp: Date.now() });
        
        // 表示コントローラーにヘルプ表示を委任
        await this.displayController.showHelp(content, context);
        
        // インタラクションを記録
        this.recordInteraction('show_help', { content, context });
    }

    /**
     * ヘルプを非表示
     */
    async hideHelp() {
        await this.displayController.hideHelp();
        this.state.activeHelp = null;
    }

    /**
     * ヘルプをリクエスト
     */
    async requestHelp(topic = null, targetElement = null) {
        const context = { 
            userRequested: true, 
            targetElement,
            priority: 'high'
        };
        
        if (topic) {
            const content = this.contentManager.getContent(topic);
            if (content) {
                await this.showContextualHelp(content.content, context);
                return;
            }
        }
        
        // 推奨コンテンツを表示
        const recommendations = this.personalizationEngine.getRecommendedContent();
        if (recommendations.length > 0) {
            const content = this.contentManager.getContent(recommendations[0]);
            if (content) {
                await this.showContextualHelp(content.content, context);
            }
        }
    }

    /**
     * ヘルプコンテンツを検索
     */
    searchHelp(query, options = {}) {
        return this.contentManager.searchContent(query, options);
    }

    /**
     * カテゴリ別ヘルプを取得
     */
    getHelpByCategory(category) {
        return this.contentManager.getByCategory(category).map(key => ({
            key,
            content: this.contentManager.getContent(key)
        }));
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // サブコンポーネントに設定を反映
        if (newConfig.displaySettings) {
            this.displayController.updateConfig(newConfig.displaySettings);
        }
        
        if (newConfig.triggers) {
            this.triggerManager.updateTriggers(newConfig.triggers);
        }
        
        if (newConfig.learning) {
            this.personalizationEngine.updatePersonalizationConfig(newConfig.learning);
        }
    }

    /**
     * インタラクションを記録
     */
    recordInteraction(type, data = {}) {
        const interaction = {
            type,
            timestamp: Date.now(),
            context: this.state.currentContext,
            ...data
        };
        
        // パーソナライゼーションエンジンに記録
        this.personalizationEngine.recordInteraction(interaction);
        
        // 統計更新
        this.updateStats(interaction);
        
        this.logEvent('interaction', interaction);
    }

    /**
     * 統計を更新
     */
    updateStats(interaction) {
        this.state.userProgress.helpRequestCount++;
        
        if (interaction.successful) {
            this.state.userProgress.successfulInteractions++;
        }
        
        if (interaction.topic) {
            this.state.userProgress.viewedTopics.add(interaction.topic);
        }
        
        if (interaction.type === 'error') {
            this.state.userProgress.errorCount++;
        }
    }

    /**
     * 進捗を取得
     */
    getProgress() {
        return {
            ...this.state.userProgress,
            viewedTopics: Array.from(this.state.userProgress.viewedTopics),
            completedTutorials: Array.from(this.state.userProgress.completedTutorials)
        };
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            progress: this.getProgress(),
            personalization: this.personalizationEngine.getPersonalizationStats(),
            triggers: this.triggerManager.getStats(),
            config: this.config,
            isActive: this.displayController.isHelp()
        };
    }

    /**
     * アクセシビリティ機能を有効化
     */
    enableAccessibilityFeatures(features = {}) {
        const accessibilityConfig = {
            highContrast: features.highContrast || false,
            largeText: features.largeText || false,
            voiceOutput: features.voiceOutput || false,
            keyboardNavigation: features.keyboardNavigation || false,
            screenReaderSupport: features.screenReaderSupport || false
        };
        
        this.updateConfig({ accessibility: accessibilityConfig });
        this.personalizationEngine.updatePreferences(accessibilityConfig);
    }

    /**
     * ヘルプ表示状態を取得
     */
    isHelpVisible() {
        return this.displayController.isHelp();
    }

    /**
     * アクティブヘルプを取得
     */
    getActiveHelp() {
        return this.state.activeHelp;
    }

    /**
     * ヘルプ履歴を取得
     */
    getHelpHistory() {
        return this.state.helpHistory;
    }

    /**
     * コンテキストを設定
     */
    setContext(context) {
        this.state.currentContext = context;
    }

    /**
     * エラーを報告
     */
    reportError(error, context = {}) {
        this.recordInteraction('error', { error, context });
        this.triggerManager.triggerHelp('error', { error, context, immediate: true });
    }

    /**
     * 成功を報告
     */
    reportSuccess(action, context = {}) {
        this.recordInteraction('success', { action, context, successful: true });
    }

    /**
     * イベントをログ
     */
    logEvent(type, data) {
        if (console && console.log) {
            console.log(`[ContextualHelp] ${type}:`, data);
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.displayController.destroy();
        this.triggerManager.destroy();
        
        this.isInitialized = false;
        this.state = {
            currentContext: null,
            activeHelp: null,
            helpHistory: [],
            userProgress: {
                completedTutorials: new Set(),
                viewedTopics: new Set(),
                helpRequestCount: 0,
                successfulInteractions: 0,
                errorCount: 0
            }
        };
    }
}