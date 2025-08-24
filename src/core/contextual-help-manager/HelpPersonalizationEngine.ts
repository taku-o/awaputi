/**
 * HelpPersonalizationEngine
 * 
 * ヘルプパーソナライゼーションエンジン機能を担当
 * Machine Learning Personalization Patternの一部として設計
 * 
 * **Features**:
 * - User learning pattern analysis and adaptation
 * - Behavioral tracking and preference inference
 * - Contextual content personalization
 * - Progressive skill level assessment
 * 
 * @module HelpPersonalizationEngine
 * Created: Phase G.6 (Issue #103)
 */

// 型定義
export interface PersonalizationConfig {
    enabled: boolean;
    trackInteractions: boolean;
    personalizeContent: boolean;
    rememberPreferences: boolean;
    adaptToProgress: boolean;
}

export interface UserProfile {
    skill_level: SkillLevel;
    preferred_help_type: HelpType;
    learning_style: LearningStyle;
    accessibility_needs: AccessibilityNeed[];
    play_frequency: PlayFrequency;
    help_usage_pattern: UsagePattern;
    created_at: number;
    last_updated: number;
}

export interface UserPreferences {
    auto_show: boolean;
    animation_speed: AnimationSpeed;
    content_detail_level: DetailLevel;
    voice_output: boolean;
    high_contrast: boolean;
    large_text: boolean;
    reduced_motion: boolean;
    keyboard_navigation: boolean;
    screen_reader_support: boolean;
}

export interface ProgressData {
    topics_viewed: Set<string>;
    concepts_mastered: Set<string>;
    help_requests: number;
    successful_interactions: number;
    error_recovery_success: number;
    preferred_topics: Map<string, number>;
    difficulty_progression: DifficultyProgression[];
}

export interface DifficultyProgression {
    timestamp: number;
    level: SkillLevel;
    confidence: number;
    evidence: ProgressionEvidence[];
}

export interface ProgressionEvidence {
    type: EvidenceType;
    value: number;
    context: string;
    weight: number;
}

export interface InteractionEvent {
    type: InteractionType;
    timestamp: number;
    context: string;
    outcome: EventOutcome;
    duration: number;
    meta_data: Record<string, any>;
}

export interface LearningPattern {
    pattern_id: string;
    description: string;
    confidence: number;
    indicators: PatternIndicator[];
    recommendations: PersonalizationRecommendation[];
}

export interface PatternIndicator {
    metric: MetricType;
    threshold: number;
    current_value: number;
    trend: TrendDirection;
}

export interface PersonalizationRecommendation {
    type: RecommendationType;
    priority: Priority;
    description: string;
    implementation: Record<string, any>;
    expected_impact: number;
}

export interface ContentAdaptation {
    original_content: any;
    adapted_content: any;
    adaptation_reason: string;
    user_factors: UserFactor[];
    confidence: number;
}

export interface UserFactor {
    name: string;
    value: any;
    weight: number;
    source: FactorSource;
}

export interface PersonalizationMetrics {
    engagement_score: number;
    learning_efficiency: number;
    help_effectiveness: number;
    user_satisfaction: number;
    adaptation_accuracy: number;
}

export interface AdaptationRule {
    id: string;
    condition: RuleCondition;
    action: RuleAction;
    priority: Priority;
    enabled: boolean;
}

export interface RuleCondition {
    user_attribute: string;
    operator: ComparisonOperator;
    value: any;
    context_requirements?: ContextRequirement[];
}

export interface RuleAction {
    type: ActionType;
    parameters: Record<string, any>;
    fallback?: RuleAction;
}

export interface ContextRequirement {
    context_key: string;
    expected_value: any;
    operator: ComparisonOperator;
}

export interface SessionData {
    session_id: string;
    start_time: number;
    end_time?: number;
    interactions: InteractionEvent[];
    adaptations_made: ContentAdaptation[];
    user_satisfaction?: number;
}

// 列挙型
export type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type HelpType = 'visual' | 'textual' | 'audio' | 'interactive' | 'mixed';
export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal';
export type AccessibilityNeed = 'screen_reader' | 'high_contrast' | 'large_text' | 'keyboard_only' | 'reduced_motion' | 'cognitive_support';
export type PlayFrequency = 'daily' | 'weekly' | 'monthly' | 'occasional' | 'new_user';
export type UsagePattern = 'help_seeker' | 'self_sufficient' | 'explorer' | 'systematic' | 'casual';
export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'instant';
export type DetailLevel = 'minimal' | 'basic' | 'detailed' | 'comprehensive';
export type EvidenceType = 'completion_time' | 'error_rate' | 'help_requests' | 'success_rate' | 'interaction_depth';
export type InteractionType = 'help_view' | 'help_search' | 'help_dismiss' | 'content_navigation' | 'preference_change';
export type EventOutcome = 'success' | 'failure' | 'partial' | 'abandoned';
export type MetricType = 'help_frequency' | 'success_rate' | 'engagement_time' | 'error_recovery' | 'topic_preference';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';
export type RecommendationType = 'content_adjustment' | 'interface_modification' | 'timing_optimization' | 'personalization_enhancement';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type FactorSource = 'user_input' | 'behavioral_analysis' | 'system_inference' | 'external_data';
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export type ActionType = 'modify_content' | 'change_interface' | 'adjust_timing' | 'recommend_feature' | 'update_profile';

// 定数
export const DEFAULT_PERSONALIZATION_CONFIG: PersonalizationConfig = {
    enabled: true,
    trackInteractions: true,
    personalizeContent: true,
    rememberPreferences: true,
    adaptToProgress: true
} as const;

export const SKILL_LEVEL_WEIGHTS = {
    novice: 1,
    beginner: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5
} as const;

export const LEARNING_STYLE_PREFERENCES = {
    visual: { content_types: ['diagrams', 'animations', 'images'], weight: 1.5 },
    auditory: { content_types: ['audio', 'narration', 'sounds'], weight: 1.3 },
    kinesthetic: { content_types: ['interactive', 'hands_on', 'practice'], weight: 1.4 },
    reading_writing: { content_types: ['text', 'lists', 'instructions'], weight: 1.2 },
    multimodal: { content_types: ['mixed', 'adaptive', 'comprehensive'], weight: 1.0 }
} as const;

export const ADAPTATION_THRESHOLDS = {
    confidence_minimum: 0.6,
    pattern_detection_samples: 10,
    skill_assessment_interactions: 5,
    preference_change_threshold: 0.3
} as const;

export const PROGRESS_TRACKING_WEIGHTS = {
    completion_time: 0.3,
    error_rate: 0.25,
    help_requests: 0.2,
    success_rate: 0.15,
    interaction_depth: 0.1
} as const;

// ユーティリティ関数
export function calculateSkillScore(profile: UserProfile, progressData: ProgressData): number {
    const baseScore = SKILL_LEVEL_WEIGHTS[profile.skill_level];
    const progressFactor = progressData.successful_interactions / Math.max(progressData.help_requests, 1);
    const masteryFactor = progressData.concepts_mastered.size / Math.max(progressData.topics_viewed.size, 1);
    
    return Math.min(5, baseScore * progressFactor * masteryFactor);
}

export function inferLearningStyle(interactions: InteractionEvent[]): LearningStyle {
    const styleCounts = {
        visual: 0,
        auditory: 0,
        kinesthetic: 0,
        reading_writing: 0,
        multimodal: 0
    };

    interactions.forEach(interaction => {
        // 学習スタイルを推論するロジック（簡略化）
        if (interaction.context.includes('visual') || interaction.context.includes('image')) {
            styleCounts.visual++;
        }
        if (interaction.context.includes('audio') || interaction.context.includes('sound')) {
            styleCounts.auditory++;
        }
        if (interaction.context.includes('interactive') || interaction.context.includes('practice')) {
            styleCounts.kinesthetic++;
        }
        if (interaction.context.includes('text') || interaction.context.includes('read')) {
            styleCounts.reading_writing++;
        }
    });

    const maxCount = Math.max(...Object.values(styleCounts));
    if (maxCount === 0) return 'multimodal';

    return Object.keys(styleCounts).find(style => styleCounts[style] === maxCount) as LearningStyle || 'multimodal';
}

export function detectUsagePattern(progressData: ProgressData, interactions: InteractionEvent[]): UsagePattern {
    const helpRequestRatio = progressData.help_requests / Math.max(progressData.successful_interactions, 1);
    const explorationRatio = progressData.topics_viewed.size / Math.max(progressData.concepts_mastered.size, 1);
    
    if (helpRequestRatio > 2) return 'help_seeker';
    if (helpRequestRatio < 0.5) return 'self_sufficient';
    if (explorationRatio > 3) return 'explorer';
    if (explorationRatio < 1.5) return 'systematic';
    
    return 'casual';
}

export function generatePersonalizationId(): string {
    return `pers_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class HelpPersonalizationEngine {
    private config: PersonalizationConfig;
    private userProfile: UserProfile | null;
    private userPreferences: UserPreferences;
    private progressData: ProgressData;
    private sessionData: SessionData | null;
    private adaptationRules: Map<string, AdaptationRule>;
    private learningPatterns: LearningPattern[];
    private metrics: PersonalizationMetrics;
    private interactionHistory: InteractionEvent[];

    constructor() {
        this.config = { ...DEFAULT_PERSONALIZATION_CONFIG };
        this.userProfile = null;
        this.userPreferences = this.initializeDefaultPreferences();
        this.progressData = this.initializeProgressData();
        this.sessionData = null;
        this.adaptationRules = new Map();
        this.learningPatterns = [];
        this.metrics = this.initializeMetrics();
        this.interactionHistory = [];

        this.initializeDefaultRules();
        console.log('[HelpPersonalizationEngine] Engine initialized');
    }

    /**
     * デフォルト設定を初期化
     */
    private initializeDefaultPreferences(): UserPreferences {
        return {
            auto_show: true,
            animation_speed: 'normal',
            content_detail_level: 'basic',
            voice_output: false,
            high_contrast: false,
            large_text: false,
            reduced_motion: false,
            keyboard_navigation: false,
            screen_reader_support: false
        };
    }

    /**
     * 進捗データを初期化
     */
    private initializeProgressData(): ProgressData {
        return {
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
     * メトリクスを初期化
     */
    private initializeMetrics(): PersonalizationMetrics {
        return {
            engagement_score: 0,
            learning_efficiency: 0,
            help_effectiveness: 0,
            user_satisfaction: 0,
            adaptation_accuracy: 0
        };
    }

    /**
     * デフォルト適応ルールを初期化
     */
    private initializeDefaultRules(): void {
        // スキルレベルベースのルール
        this.adaptationRules.set('skill_based_detail', {
            id: 'skill_based_detail',
            condition: {
                user_attribute: 'skill_level',
                operator: 'eq',
                value: 'novice'
            },
            action: {
                type: 'modify_content',
                parameters: { detail_level: 'comprehensive', examples: true }
            },
            priority: 'high',
            enabled: true
        });

        // アクセシビリティベースのルール
        this.adaptationRules.set('accessibility_support', {
            id: 'accessibility_support',
            condition: {
                user_attribute: 'accessibility_needs',
                operator: 'contains',
                value: 'screen_reader'
            },
            action: {
                type: 'change_interface',
                parameters: { aria_enhanced: true, keyboard_navigation: true }
            },
            priority: 'critical',
            enabled: true
        });
    }

    /**
     * ユーザープロファイルを作成
     */
    createUserProfile(initialData: Partial<UserProfile> = {}): UserProfile {
        const now = Date.now();
        
        this.userProfile = {
            skill_level: 'beginner',
            preferred_help_type: 'mixed',
            learning_style: 'multimodal',
            accessibility_needs: [],
            play_frequency: 'new_user',
            help_usage_pattern: 'casual',
            created_at: now,
            last_updated: now,
            ...initialData
        };

        return this.userProfile;
    }

    /**
     * インタラクションを追跡
     */
    trackInteraction(event: Omit<InteractionEvent, 'timestamp'>): void {
        if (!this.config.trackInteractions) return;

        const interaction: InteractionEvent = {
            ...event,
            timestamp: Date.now()
        };

        this.interactionHistory.push(interaction);
        this.updateProgressData(interaction);
        this.updateLearningPatterns(interaction);

        // セッションデータの更新
        if (this.sessionData) {
            this.sessionData.interactions.push(interaction);
        }
    }

    /**
     * 進捗データを更新
     */
    private updateProgressData(interaction: InteractionEvent): void {
        this.progressData.help_requests++;

        if (interaction.outcome === 'success') {
            this.progressData.successful_interactions++;
        }

        // トピック関連の更新
        if (interaction.meta_data.topic) {
            this.progressData.topics_viewed.add(interaction.meta_data.topic);
            
            const currentCount = this.progressData.preferred_topics.get(interaction.meta_data.topic) || 0;
            this.progressData.preferred_topics.set(interaction.meta_data.topic, currentCount + 1);
        }

        // 概念習得の判定
        if (interaction.outcome === 'success' && interaction.meta_data.concept) {
            this.progressData.concepts_mastered.add(interaction.meta_data.concept);
        }
    }

    /**
     * 学習パターンを更新
     */
    private updateLearningPatterns(interaction: InteractionEvent): void {
        // 学習スタイルの推論
        if (this.userProfile && this.interactionHistory.length >= 10) {
            const inferredStyle = inferLearningStyle(this.interactionHistory);
            if (inferredStyle !== this.userProfile.learning_style) {
                this.userProfile.learning_style = inferredStyle;
                this.userProfile.last_updated = Date.now();
            }
        }

        // 使用パターンの検出
        if (this.userProfile && this.interactionHistory.length >= 5) {
            const detectedPattern = detectUsagePattern(this.progressData, this.interactionHistory);
            if (detectedPattern !== this.userProfile.help_usage_pattern) {
                this.userProfile.help_usage_pattern = detectedPattern;
                this.userProfile.last_updated = Date.now();
            }
        }
    }

    /**
     * コンテンツを個人化
     */
    personalizeContent(originalContent: any, context: Record<string, any> = {}): ContentAdaptation {
        if (!this.config.personalizeContent || !this.userProfile) {
            return {
                original_content: originalContent,
                adapted_content: originalContent,
                adaptation_reason: 'No personalization applied',
                user_factors: [],
                confidence: 0
            };
        }

        const userFactors: UserFactor[] = [
            {
                name: 'skill_level',
                value: this.userProfile.skill_level,
                weight: 0.3,
                source: 'user_input'
            },
            {
                name: 'learning_style',
                value: this.userProfile.learning_style,
                weight: 0.25,
                source: 'behavioral_analysis'
            },
            {
                name: 'preferred_help_type',
                value: this.userProfile.preferred_help_type,
                weight: 0.2,
                source: 'behavioral_analysis'
            }
        ];

        let adaptedContent = { ...originalContent };
        let adaptationReason = '';
        let confidence = 0;

        // スキルレベルベースの適応
        if (this.userProfile.skill_level === 'novice' || this.userProfile.skill_level === 'beginner') {
            adaptedContent = this.addDetailedExplanations(adaptedContent);
            adaptationReason += 'Added detailed explanations for beginner level; ';
            confidence += 0.3;
        }

        // 学習スタイルベースの適応
        const stylePrefs = LEARNING_STYLE_PREFERENCES[this.userProfile.learning_style];
        if (stylePrefs) {
            adaptedContent = this.adjustContentForLearningStyle(adaptedContent, stylePrefs);
            adaptationReason += `Adjusted for ${this.userProfile.learning_style} learning style; `;
            confidence += 0.25;
        }

        // アクセシビリティ適応
        if (this.userProfile.accessibility_needs.length > 0) {
            adaptedContent = this.applyAccessibilityAdaptations(adaptedContent, this.userProfile.accessibility_needs);
            adaptationReason += 'Applied accessibility adaptations; ';
            confidence += 0.2;
        }

        return {
            original_content: originalContent,
            adapted_content: adaptedContent,
            adaptation_reason: adaptationReason.trim(),
            user_factors: userFactors,
            confidence: Math.min(1, confidence)
        };
    }

    /**
     * 詳細説明を追加
     */
    private addDetailedExplanations(content: any): any {
        if (content.description && typeof content.description === 'string') {
            content.description += ' （初心者向けの詳細説明が含まれています）';
        }

        if (content.steps && Array.isArray(content.steps)) {
            content.steps = content.steps.map(step => ({
                ...step,
                tips: [...(step.tips || []), 'ゆっくりと進めましょう', '困ったときはヘルプを参照してください']
            }));
        }

        return content;
    }

    /**
     * 学習スタイルに応じてコンテンツを調整
     */
    private adjustContentForLearningStyle(content: any, stylePrefs: any): any {
        if (stylePrefs.content_types.includes('visual') && content.visual) {
            content.emphasize_visual = true;
        }

        if (stylePrefs.content_types.includes('interactive') && content.interactive) {
            content.emphasize_interactive = true;
        }

        return content;
    }

    /**
     * アクセシビリティ適応を適用
     */
    private applyAccessibilityAdaptations(content: any, needs: AccessibilityNeed[]): any {
        if (needs.includes('screen_reader')) {
            content.aria_enhanced = true;
            content.screen_reader_text = 'スクリーンリーダー対応のコンテンツです';
        }

        if (needs.includes('high_contrast')) {
            content.high_contrast_mode = true;
        }

        if (needs.includes('large_text')) {
            content.font_size_boost = true;
        }

        return content;
    }

    /**
     * 推奨事項を取得
     */
    getRecommendations(): PersonalizationRecommendation[] {
        const recommendations: PersonalizationRecommendation[] = [];

        if (!this.userProfile) return recommendations;

        // スキルレベル進歩の推奨
        const skillScore = calculateSkillScore(this.userProfile, this.progressData);
        if (skillScore > SKILL_LEVEL_WEIGHTS[this.userProfile.skill_level] + 0.5) {
            recommendations.push({
                type: 'content_adjustment',
                priority: 'medium',
                description: 'より高難度のコンテンツを提供することを推奨します',
                implementation: { increase_difficulty: true },
                expected_impact: 0.7
            });
        }

        // 学習効率向上の推奨
        if (this.metrics.learning_efficiency < 0.6) {
            recommendations.push({
                type: 'interface_modification',
                priority: 'high',
                description: '学習効率向上のためのインターフェース改善を推奨します',
                implementation: { optimize_layout: true, reduce_distractions: true },
                expected_impact: 0.8
            });
        }

        return recommendations;
    }

    /**
     * セッションを開始
     */
    startSession(): string {
        const sessionId = generatePersonalizationId();
        
        this.sessionData = {
            session_id: sessionId,
            start_time: Date.now(),
            interactions: [],
            adaptations_made: []
        };

        return sessionId;
    }

    /**
     * セッションを終了
     */
    endSession(satisfaction?: number): SessionData | null {
        if (!this.sessionData) return null;

        this.sessionData.end_time = Date.now();
        if (satisfaction !== undefined) {
            this.sessionData.user_satisfaction = satisfaction;
            this.metrics.user_satisfaction = satisfaction;
        }

        const completedSession = { ...this.sessionData };
        this.sessionData = null;

        return completedSession;
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<PersonalizationConfig>): void {
        Object.assign(this.config, newConfig);
    }

    /**
     * ユーザー設定を更新
     */
    updatePreferences(newPreferences: Partial<UserPreferences>): void {
        Object.assign(this.userPreferences, newPreferences);
    }

    /**
     * メトリクスを取得
     */
    getMetrics(): PersonalizationMetrics {
        return { ...this.metrics };
    }

    /**
     * ユーザープロファイルを取得
     */
    getUserProfile(): UserProfile | null {
        return this.userProfile ? { ...this.userProfile } : null;
    }

    /**
     * 進捗データを取得
     */
    getProgressData(): ProgressData {
        return {
            ...this.progressData,
            topics_viewed: new Set(this.progressData.topics_viewed),
            concepts_mastered: new Set(this.progressData.concepts_mastered),
            preferred_topics: new Map(this.progressData.preferred_topics)
        };
    }

    /**
     * インタラクション履歴を取得
     */
    getInteractionHistory(limit?: number): InteractionEvent[] {
        const history = [...this.interactionHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * データをリセット
     */
    resetUserData(): void {
        this.userProfile = null;
        this.progressData = this.initializeProgressData();
        this.interactionHistory = [];
        this.metrics = this.initializeMetrics();
        this.sessionData = null;
        console.log('[HelpPersonalizationEngine] User data reset');
    }

    /**
     * エンジンを破棄
     */
    destroy(): void {
        this.resetUserData();
        this.adaptationRules.clear();
        this.learningPatterns = [];
        console.log('[HelpPersonalizationEngine] Engine destroyed');
    }
}