/**
 * HelpPersonalizationEngine - ヘルプパーソナライゼーションエンジン
 * 
 * ユーザーの学習パターン、設定、行動を分析してパーソナライズされたヘルプを提供
 */

export class HelpPersonalizationEngine {
    constructor() {
        this.learningConfig = {
            enabled: true,
            trackInteractions: true,
            personalizeContent: true,
            rememberPreferences: true,
            adaptToProgress: true
        };
        
        this.userProfile = this.loadUserProfile();
        this.interactionHistory = [];
        this.preferences = this.loadPreferences();
        this.progressData = this.loadProgressData();
        
        this.initializePersonalization();
    }

    /**
     * パーソナライゼーションを初期化
     */
    initializePersonalization() {
        this.updateUserProfile();
        this.startLearning();
    }

    /**
     * ユーザープロファイルを読み込み
     */
    loadUserProfile() {
        const stored = localStorage.getItem('bubblePop_userProfile');
        return stored ? JSON.parse(stored) : {
            skill_level: 'beginner',
            preferred_help_type: 'detailed',
            learning_style: 'visual',
            accessibility_needs: [],
            play_frequency: 'occasional',
            help_usage_pattern: 'reactive',
            created_at: Date.now(),
            last_updated: Date.now()
        };
    }

    /**
     * ユーザー設定を読み込み
     */
    loadPreferences() {
        const stored = localStorage.getItem('bubblePop_helpPreferences');
        return stored ? JSON.parse(stored) : {
            auto_show: true,
            animation_speed: 'normal',
            content_detail_level: 'medium',
            voice_output: false,
            high_contrast: false,
            large_text: false,
            reduced_motion: false,
            keyboard_navigation: false,
            screen_reader_support: false
        };
    }

    /**
     * 進捗データを読み込み
     */
    loadProgressData() {
        const stored = localStorage.getItem('bubblePop_helpProgress');
        return stored ? JSON.parse(stored) : {
            topics_viewed: new Set(),
            concepts_mastered: new Set(),
            help_requests: 0,
            successful_interactions: 0,
            error_recovery_success: 0,
            preferred_topics: new Map(),
            difficulty_progression: []
        };
    }

    /**
     * ユーザープロファイルを更新
     */
    updateUserProfile() {
        const now = Date.now();
        const daysSinceCreation = (now - this.userProfile.created_at) / (1000 * 60 * 60 * 24);
        
        // スキルレベルの自動調整
        this.updateSkillLevel();
        
        // プレイ頻度の計算
        this.updatePlayFrequency(daysSinceCreation);
        
        // ヘルプ使用パターンの分析
        this.updateHelpUsagePattern();
        
        this.userProfile.last_updated = now;
        this.saveUserProfile();
    }

    /**
     * スキルレベルを更新
     */
    updateSkillLevel() {
        const successRate = this.calculateSuccessRate();
        const masteredConcepts = this.progressData.concepts_mastered.size;
        
        if (successRate > 0.8 && masteredConcepts > 10) {
            this.userProfile.skill_level = 'advanced';
        } else if (successRate > 0.6 && masteredConcepts > 5) {
            this.userProfile.skill_level = 'intermediate';
        } else {
            this.userProfile.skill_level = 'beginner';
        }
    }

    /**
     * プレイ頻度を更新
     */
    updatePlayFrequency(daysSinceCreation) {
        const helpRequests = this.progressData.help_requests;
        const requestsPerDay = helpRequests / Math.max(daysSinceCreation, 1);
        
        if (requestsPerDay > 5) {
            this.userProfile.play_frequency = 'frequent';
        } else if (requestsPerDay > 1) {
            this.userProfile.play_frequency = 'regular';
        } else {
            this.userProfile.play_frequency = 'occasional';
        }
    }

    /**
     * ヘルプ使用パターンを更新
     */
    updateHelpUsagePattern() {
        const recentInteractions = this.interactionHistory.slice(-20);
        const proactiveRequests = recentInteractions.filter(i => i.type === 'proactive').length;
        
        if (proactiveRequests > recentInteractions.length * 0.7) {
            this.userProfile.help_usage_pattern = 'proactive';
        } else if (proactiveRequests > recentInteractions.length * 0.3) {
            this.userProfile.help_usage_pattern = 'mixed';
        } else {
            this.userProfile.help_usage_pattern = 'reactive';
        }
    }

    /**
     * 成功率を計算
     */
    calculateSuccessRate() {
        const total = this.progressData.help_requests;
        const successful = this.progressData.successful_interactions;
        return total > 0 ? successful / total : 0;
    }

    /**
     * パーソナライズされたヘルプコンテンツを取得
     */
    getPersonalizedContent(baseContent, context = {}) {
        let personalizedContent = { ...baseContent };
        
        // スキルレベルに応じた調整
        personalizedContent = this.adjustForSkillLevel(personalizedContent);
        
        // 学習スタイルに応じた調整
        personalizedContent = this.adjustForLearningStyle(personalizedContent);
        
        // アクセシビリティニーズに応じた調整
        personalizedContent = this.adjustForAccessibility(personalizedContent);
        
        // 設定に応じた調整
        personalizedContent = this.adjustForPreferences(personalizedContent);
        
        // コンテキストに応じた調整
        personalizedContent = this.adjustForContext(personalizedContent, context);
        
        return personalizedContent;
    }

    /**
     * スキルレベルに応じて調整
     */
    adjustForSkillLevel(content) {
        const adjusted = { ...content };
        
        switch (this.userProfile.skill_level) {
            case 'beginner':
                adjusted.detail_level = 'high';
                adjusted.include_examples = true;
                adjusted.include_basics = true;
                adjusted.simplified_language = true;
                break;
            case 'intermediate':
                adjusted.detail_level = 'medium';
                adjusted.include_examples = true;
                adjusted.include_tips = true;
                adjusted.focus_on_efficiency = true;
                break;
            case 'advanced':
                adjusted.detail_level = 'low';
                adjusted.include_advanced_tips = true;
                adjusted.focus_on_optimization = true;
                adjusted.concise_format = true;
                break;
        }
        
        return adjusted;
    }

    /**
     * 学習スタイルに応じて調整
     */
    adjustForLearningStyle(content) {
        const adjusted = { ...content };
        
        switch (this.userProfile.learning_style) {
            case 'visual':
                adjusted.include_diagrams = true;
                adjusted.highlight_key_points = true;
                adjusted.use_colors = true;
                adjusted.step_by_step_visual = true;
                break;
            case 'auditory':
                adjusted.include_audio = true;
                adjusted.voice_explanations = true;
                adjusted.rhythm_mnemonics = true;
                break;
            case 'kinesthetic':
                adjusted.interactive_elements = true;
                adjusted.hands_on_practice = true;
                adjusted.gesture_hints = true;
                break;
            case 'reading':
                adjusted.detailed_text = true;
                adjusted.structured_content = true;
                adjusted.reference_links = true;
                break;
        }
        
        return adjusted;
    }

    /**
     * アクセシビリティニーズに応じて調整
     */
    adjustForAccessibility(content) {
        const adjusted = { ...content };
        const needs = this.userProfile.accessibility_needs;
        
        if (needs.includes('screen_reader')) {
            adjusted.alt_text = true;
            adjusted.structured_headings = true;
            adjusted.descriptive_text = true;
            adjusted.no_color_only_info = true;
        }
        
        if (needs.includes('motor_impairment')) {
            adjusted.large_click_targets = true;
            adjusted.keyboard_shortcuts = true;
            adjusted.voice_control = true;
        }
        
        if (needs.includes('cognitive_support')) {
            adjusted.simple_language = true;
            adjusted.clear_structure = true;
            adjusted.memory_aids = true;
            adjusted.progress_indicators = true;
        }
        
        if (needs.includes('visual_impairment')) {
            adjusted.high_contrast = true;
            adjusted.large_text = true;
            adjusted.clear_focus_indicators = true;
        }
        
        return adjusted;
    }

    /**
     * ユーザー設定に応じて調整
     */
    adjustForPreferences(content) {
        const adjusted = { ...content };
        
        if (this.preferences.high_contrast) {
            adjusted.use_high_contrast = true;
        }
        
        if (this.preferences.large_text) {
            adjusted.font_size = 'large';
        }
        
        if (this.preferences.reduced_motion) {
            adjusted.disable_animations = true;
        }
        
        if (this.preferences.voice_output) {
            adjusted.include_speech = true;
        }
        
        switch (this.preferences.content_detail_level) {
            case 'minimal':
                adjusted.show_only_essentials = true;
                break;
            case 'detailed':
                adjusted.include_all_details = true;
                break;
        }
        
        return adjusted;
    }

    /**
     * コンテキストに応じて調整
     */
    adjustForContext(content, context) {
        const adjusted = { ...content };
        
        // エラー状況での調整
        if (context.triggerType === 'error') {
            adjusted.priority = 'high';
            adjusted.focus_on_solution = true;
            adjusted.calming_tone = true;
        }
        
        // 初回訪問での調整
        if (context.triggerType === 'firstVisit') {
            adjusted.welcome_tone = true;
            adjusted.overview_focus = true;
            adjusted.encourage_exploration = true;
        }
        
        // 行き詰まり状況での調整
        if (context.triggerType === 'stuck') {
            adjusted.alternative_approaches = true;
            adjusted.step_by_step_guidance = true;
            adjusted.encouragement = true;
        }
        
        // 時間帯による調整
        const hour = new Date().getHours();
        if (hour < 6 || hour > 22) {
            adjusted.quiet_mode = true;
            adjusted.reduced_distractions = true;
        }
        
        return adjusted;
    }

    /**
     * インタラクションを記録
     */
    recordInteraction(interaction) {
        if (!this.learningConfig.trackInteractions) return;
        
        const record = {
            ...interaction,
            timestamp: Date.now(),
            user_profile: { ...this.userProfile },
            context: interaction.context || {}
        };
        
        this.interactionHistory.push(record);
        
        // 履歴サイズを制限
        if (this.interactionHistory.length > 1000) {
            this.interactionHistory = this.interactionHistory.slice(-500);
        }
        
        this.updateProgressFromInteraction(record);
        this.saveInteractionHistory();
    }

    /**
     * インタラクションから進捗を更新
     */
    updateProgressFromInteraction(interaction) {
        this.progressData.help_requests++;
        
        if (interaction.successful) {
            this.progressData.successful_interactions++;
        }
        
        if (interaction.topic) {
            this.progressData.topics_viewed.add(interaction.topic);
        }
        
        if (interaction.concept_mastered) {
            this.progressData.concepts_mastered.add(interaction.concept_mastered);
        }
        
        if (interaction.error_resolved) {
            this.progressData.error_recovery_success++;
        }
        
        this.saveProgressData();
    }

    /**
     * おすすめコンテンツを取得
     */
    getRecommendedContent() {
        const recommendations = [];
        
        // スキルレベルに基づく推奨
        const skillBasedContent = this.getSkillBasedRecommendations();
        recommendations.push(...skillBasedContent);
        
        // 学習パターンに基づく推奨
        const patternBasedContent = this.getPatternBasedRecommendations();
        recommendations.push(...patternBasedContent);
        
        // 進捗に基づく推奨
        const progressBasedContent = this.getProgressBasedRecommendations();
        recommendations.push(...progressBasedContent);
        
        return this.prioritizeRecommendations(recommendations);
    }

    /**
     * スキルベースの推奨を取得
     */
    getSkillBasedRecommendations() {
        const recommendations = [];
        
        switch (this.userProfile.skill_level) {
            case 'beginner':
                recommendations.push('gameBasics', 'controls', 'firstSteps');
                break;
            case 'intermediate':
                recommendations.push('strategy', 'efficiency', 'specialFeatures');
                break;
            case 'advanced':
                recommendations.push('optimization', 'advanced_techniques', 'customization');
                break;
        }
        
        return recommendations;
    }

    /**
     * パターンベースの推奨を取得
     */
    getPatternBasedRecommendations() {
        const recommendations = [];
        const recentErrors = this.interactionHistory
            .filter(i => i.type === 'error' && Date.now() - i.timestamp < 86400000)
            .length;
        
        if (recentErrors > 3) {
            recommendations.push('troubleshooting', 'error_prevention');
        }
        
        const viewedTopics = Array.from(this.progressData.topics_viewed);
        if (viewedTopics.length < 3) {
            recommendations.push('overview', 'getting_started');
        }
        
        return recommendations;
    }

    /**
     * 進捗ベースの推奨を取得
     */
    getProgressBasedRecommendations() {
        const recommendations = [];
        const masteredConcepts = this.progressData.concepts_mastered.size;
        
        if (masteredConcepts > 5) {
            recommendations.push('advanced_topics', 'next_level');
        } else {
            recommendations.push('foundational_concepts', 'practice_exercises');
        }
        
        return recommendations;
    }

    /**
     * 推奨事項を優先順位付け
     */
    prioritizeRecommendations(recommendations) {
        return recommendations
            .map(topic => ({
                topic,
                score: this.calculateRecommendationScore(topic)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.topic);
    }

    /**
     * 推奨スコアを計算
     */
    calculateRecommendationScore(topic) {
        let score = 0;
        
        // 基本スコア
        score += 10;
        
        // 未視聴コンテンツに加点
        if (!this.progressData.topics_viewed.has(topic)) {
            score += 20;
        }
        
        // スキルレベル適合度
        const skillRelevance = this.getSkillRelevanceScore(topic);
        score += skillRelevance * 15;
        
        // 最近のエラーパターン
        const errorRelevance = this.getErrorRelevanceScore(topic);
        score += errorRelevance * 25;
        
        return score;
    }

    /**
     * スキル関連性スコアを取得
     */
    getSkillRelevanceScore(topic) {
        // 実装省略 - トピックとスキルレベルの関連度を返す
        return Math.random(); // プレースホルダー
    }

    /**
     * エラー関連性スコアを取得
     */
    getErrorRelevanceScore(topic) {
        // 実装省略 - トピックと最近のエラーの関連度を返す
        return Math.random(); // プレースホルダー
    }

    /**
     * 学習を開始
     */
    startLearning() {
        if (!this.learningConfig.enabled) return;
        
        // 定期的な分析とプロファイル更新
        setInterval(() => {
            this.analyzeUserBehavior();
            this.updateUserProfile();
        }, 300000); // 5分ごと
    }

    /**
     * ユーザー行動を分析
     */
    analyzeUserBehavior() {
        const recentInteractions = this.interactionHistory.slice(-50);
        
        // 学習スタイルの推測
        this.inferLearningStyle(recentInteractions);
        
        // 設定の自動調整
        this.autoAdjustPreferences(recentInteractions);
    }

    /**
     * 学習スタイルを推測
     */
    inferLearningStyle(interactions) {
        const visualCount = interactions.filter(i => i.used_visuals).length;
        const audioCount = interactions.filter(i => i.used_audio).length;
        const interactiveCount = interactions.filter(i => i.used_interaction).length;
        
        const max = Math.max(visualCount, audioCount, interactiveCount);
        
        if (max === visualCount) {
            this.userProfile.learning_style = 'visual';
        } else if (max === audioCount) {
            this.userProfile.learning_style = 'auditory';
        } else if (max === interactiveCount) {
            this.userProfile.learning_style = 'kinesthetic';
        }
    }

    /**
     * 設定を自動調整
     */
    autoAdjustPreferences(interactions) {
        const dismissedQuickly = interactions.filter(i => 
            i.duration && i.duration < 2000
        ).length;
        
        if (dismissedQuickly > interactions.length * 0.7) {
            this.preferences.content_detail_level = 'minimal';
            this.preferences.auto_show = false;
        }
    }

    /**
     * データを保存
     */
    saveUserProfile() {
        localStorage.setItem('bubblePop_userProfile', JSON.stringify(this.userProfile));
    }

    savePreferences() {
        localStorage.setItem('bubblePop_helpPreferences', JSON.stringify(this.preferences));
    }

    saveProgressData() {
        const serializable = {
            ...this.progressData,
            topics_viewed: Array.from(this.progressData.topics_viewed),
            concepts_mastered: Array.from(this.progressData.concepts_mastered),
            preferred_topics: Array.from(this.progressData.preferred_topics)
        };
        localStorage.setItem('bubblePop_helpProgress', JSON.stringify(serializable));
    }

    saveInteractionHistory() {
        const recentHistory = this.interactionHistory.slice(-100);
        localStorage.setItem('bubblePop_helpHistory', JSON.stringify(recentHistory));
    }

    /**
     * 設定を更新
     */
    updatePersonalizationConfig(newConfig) {
        Object.assign(this.learningConfig, newConfig);
    }

    /**
     * ユーザー設定を更新
     */
    updatePreferences(newPreferences) {
        Object.assign(this.preferences, newPreferences);
        this.savePreferences();
    }

    /**
     * 統計情報を取得
     */
    getPersonalizationStats() {
        return {
            userProfile: { ...this.userProfile },
            interactionCount: this.interactionHistory.length,
            successRate: this.calculateSuccessRate(),
            topicsViewed: this.progressData.topics_viewed.size,
            conceptsMastered: this.progressData.concepts_mastered.size,
            preferences: { ...this.preferences }
        };
    }

    /**
     * データをリセット
     */
    resetPersonalizationData() {
        localStorage.removeItem('bubblePop_userProfile');
        localStorage.removeItem('bubblePop_helpPreferences');
        localStorage.removeItem('bubblePop_helpProgress');
        localStorage.removeItem('bubblePop_helpHistory');
        
        this.userProfile = this.loadUserProfile();
        this.preferences = this.loadPreferences();
        this.progressData = this.loadProgressData();
        this.interactionHistory = [];
    }
}