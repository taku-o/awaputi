/**
 * DataModels.ts
 * ヘルプシステムで使用するデータモデルクラス
 * HelpContent, Tutorial, FAQ, UserProgress の各モデルを定義
 */

// 基本型定義
export interface HelpContentSection {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    searchKeywords?: string[];
}

export interface TutorialStep {
    id: string;
    title: string;
    instructions: string;
    action?: string;
    target?: string;
    duration?: number;
    validation?: string;
}

export interface SearchHistoryEntry {
    query: string;
    language: string;
    timestamp: number;
}

export interface UserPreferences {
    showTooltips: boolean;
    tutorialSpeed: 'slow' | 'normal' | 'fast';
    helpLanguage: string;
}

export interface UserStatistics {
    totalHelpViews: number;
    totalSearches: number;
    totalTutorialsCompleted: number;
    timeSpentInHelp: number;
}

export interface SearchResult {
    section: HelpContentSection;
    score: number;
}

export interface ProgressStatistics {
    completedTutorials: number;
    viewedHelpSections: number;
    totalSearches: number;
    totalHelpViews: number;
    timeSpentInHelp: number;
    achievements: number;
    lastActivity: number;
}

export interface CompletionRates {
    tutorialCompletionRate: number;
    helpViewCompletionRate: number;
}

export interface SearchPatterns {
    commonQueries: Record<string, number>;
    languageDistribution: Record<string, number>;
    timeDistribution: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
    };
}

/**
 * ヘルプコンテンツモデル
 */
export class HelpContentModel {
    public id: string;
    public category: string;
    public title: string;
    public content: string;
    public tags: string[];
    public language: string;
    public version: string;
    public lastUpdated: number;
    public difficulty: 'beginner' | 'intermediate' | 'advanced';
    public relatedTopics: string[];
    public searchKeywords: string[];
    public sections: HelpContentSection[];
    public metadata: Record<string, any>;

    constructor(data: Partial<HelpContentModel> = {}) {
        this.id = data.id || '';
        this.category = data.category || '';
        this.title = data.title || '';
        this.content = data.content || '';
        this.tags = data.tags || [];
        this.language = data.language || 'ja';
        this.version = data.version || '1.0.0';
        this.lastUpdated = data.lastUpdated || Date.now();
        this.difficulty = data.difficulty || 'beginner';
        this.relatedTopics = data.relatedTopics || [];
        this.searchKeywords = data.searchKeywords || [];
        this.sections = data.sections || [];
        this.metadata = data.metadata || {};
    }

    /**
     * データの検証
     * @returns 検証結果
     */
    validate(): boolean {
        try {
            // 必須フィールドの確認
            if (!this.version || !this.language) {
                return false;
            }

            // セクションデータの確認
            if (!Array.isArray(this.sections) || this.sections.length === 0) {
                return false;
            }

            // 各セクションの検証
            for (const section of this.sections) {
                if (!section.id || !section.title || !section.content) {
                    return false;
                }
            }

            // 言語コードの形式確認
            if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(this.language)) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * セクションの取得
     * @param sectionId - セクションID
     * @returns セクションデータ
     */
    getSection(sectionId: string): HelpContentSection | null {
        return this.sections.find(section => section.id === sectionId) || null;
    }

    /**
     * タグによるフィルタリング
     * @param tags - フィルター対象タグ
     * @returns マッチするセクション
     */
    filterByTags(tags: string[]): HelpContentSection[] {
        if (!tags || tags.length === 0) return this.sections;
        
        return this.sections.filter(section => 
            section.tags && section.tags.some(tag => tags.includes(tag))
        );
    }

    /**
     * 難易度によるフィルタリング
     * @param difficulty - 難易度
     * @returns マッチするセクション
     */
    filterByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): HelpContentSection[] {
        return this.sections.filter(section => section.difficulty === difficulty);
    }

    /**
     * 検索
     * @param query - 検索クエリ
     * @returns 検索結果
     */
    search(query: string): SearchResult[] {
        if (!query) return [];
        
        const queryLower = query.toLowerCase();
        const results: SearchResult[] = [];
        
        for (const section of this.sections) {
            let score = 0;
            
            // タイトルでの一致
            if (section.title.toLowerCase().includes(queryLower)) {
                score += 10;
            }
            
            // コンテンツでの一致
            if (section.content.toLowerCase().includes(queryLower)) {
                score += 5;
            }
            
            // タグでの一致
            if (section.tags && section.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
                score += 7;
            }
            
            // キーワードでの一致
            if (section.searchKeywords && section.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
                score += 8;
            }
            
            if (score > 0) {
                results.push({ section, score });
            }
        }
        
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * JSON形式での出力
     * @returns JSON形式のデータ
     */
    toJSON(): Record<string, any> {
        return {
            id: this.id,
            category: this.category,
            title: this.title,
            content: this.content,
            tags: this.tags,
            language: this.language,
            version: this.version,
            lastUpdated: this.lastUpdated,
            difficulty: this.difficulty,
            relatedTopics: this.relatedTopics,
            searchKeywords: this.searchKeywords,
            sections: this.sections,
            metadata: this.metadata
        };
    }
}

/**
 * チュートリアルモデル
 */
export class TutorialModel {
    public id: string;
    public title: string;
    public description: string;
    public category: string;
    public steps: TutorialStep[];
    public prerequisites: string[];
    public estimatedDuration: number;
    public language: string;
    public version: string;
    public lastUpdated: number;
    public difficulty: 'beginner' | 'intermediate' | 'advanced';
    public tags: string[];
    public metadata: Record<string, any>;

    constructor(data: Partial<TutorialModel> = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.steps = data.steps || [];
        this.prerequisites = data.prerequisites || [];
        this.estimatedDuration = data.estimatedDuration || 0;
        this.language = data.language || 'ja';
        this.version = data.version || '1.0.0';
        this.lastUpdated = data.lastUpdated || Date.now();
        this.difficulty = data.difficulty || 'beginner';
        this.tags = data.tags || [];
        this.metadata = data.metadata || {};
    }

    /**
     * データの検証
     * @returns 検証結果
     */
    validate(): boolean {
        try {
            // 必須フィールドの確認
            if (!this.id || !this.title || !this.language) {
                return false;
            }

            // ステップデータの確認
            if (!Array.isArray(this.steps) || this.steps.length === 0) {
                return false;
            }

            // 各ステップの検証
            for (const step of this.steps) {
                if (!step.id || !step.title || !step.instructions) {
                    return false;
                }
            }

            // 推定時間の確認
            if (this.estimatedDuration < 0) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * ステップの取得
     * @param stepId - ステップID
     * @returns ステップデータ
     */
    getStep(stepId: string): TutorialStep | null {
        return this.steps.find(step => step.id === stepId) || null;
    }

    /**
     * インデックスによるステップ取得
     * @param index - ステップインデックス
     * @returns ステップデータ
     */
    getStepByIndex(index: number): TutorialStep | null {
        if (index < 0 || index >= this.steps.length) {
            return null;
        }
        return this.steps[index];
    }

    /**
     * 次のステップ取得
     * @param currentStepId - 現在のステップID
     * @returns 次のステップ
     */
    getNextStep(currentStepId: string): TutorialStep | null {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex === -1 || currentIndex >= this.steps.length - 1) {
            return null;
        }
        return this.steps[currentIndex + 1];
    }

    /**
     * 前のステップ取得
     * @param currentStepId - 現在のステップID
     * @returns 前のステップ
     */
    getPreviousStep(currentStepId: string): TutorialStep | null {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex <= 0) {
            return null;
        }
        return this.steps[currentIndex - 1];
    }

    /**
     * 進捗率の計算
     * @param currentStepId - 現在のステップID
     * @returns 進捗率（0-100）
     */
    getProgress(currentStepId: string): number {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex === -1) return 0;
        
        return Math.round(((currentIndex + 1) / this.steps.length) * 100);
    }

    /**
     * 完了チェック
     * @param currentStepId - 現在のステップID
     * @returns 完了フラグ
     */
    isCompleted(currentStepId: string): boolean {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        return currentIndex === this.steps.length - 1;
    }

    /**
     * 前提条件チェック
     * @param completedTutorials - 完了済みチュートリアル
     * @returns 前提条件満たしフラグ
     */
    checkPrerequisites(completedTutorials: Set<string>): boolean {
        if (!this.prerequisites || this.prerequisites.length === 0) {
            return true;
        }
        
        return this.prerequisites.every(prereq => completedTutorials.has(prereq));
    }

    /**
     * JSON形式での出力
     * @returns JSON形式のデータ
     */
    toJSON(): Record<string, any> {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            steps: this.steps,
            prerequisites: this.prerequisites,
            estimatedDuration: this.estimatedDuration,
            language: this.language,
            version: this.version,
            lastUpdated: this.lastUpdated,
            difficulty: this.difficulty,
            tags: this.tags,
            metadata: this.metadata
        };
    }
}

/**
 * FAQモデル
 */
export class FAQModel {
    public id: string;
    public question: string;
    public answer: string;
    public category: string;
    public tags: string[];
    public language: string;
    public popularity: number;
    public lastUpdated: number;
    public relatedQuestions: string[];
    public helpfulVotes: number;
    public totalVotes: number;
    public difficulty: 'beginner' | 'intermediate' | 'advanced';
    public searchKeywords: string[];
    public metadata: Record<string, any>;

    constructor(data: Partial<FAQModel> = {}) {
        this.id = data.id || '';
        this.question = data.question || '';
        this.answer = data.answer || '';
        this.category = data.category || '';
        this.tags = data.tags || [];
        this.language = data.language || 'ja';
        this.popularity = data.popularity || 0;
        this.lastUpdated = data.lastUpdated || Date.now();
        this.relatedQuestions = data.relatedQuestions || [];
        this.helpfulVotes = data.helpfulVotes || 0;
        this.totalVotes = data.totalVotes || 0;
        this.difficulty = data.difficulty || 'beginner';
        this.searchKeywords = data.searchKeywords || [];
        this.metadata = data.metadata || {};
    }

    /**
     * データの検証
     * @returns 検証結果
     */
    validate(): boolean {
        try {
            // 必須フィールドの確認
            if (!this.id || !this.question || !this.answer || !this.language) {
                return false;
            }

            // 統計データの確認
            if (this.helpfulVotes < 0 || this.totalVotes < 0 || this.helpfulVotes > this.totalVotes) {
                return false;
            }

            // 人気度の確認
            if (this.popularity < 0) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 有用性評価の取得
     * @returns 有用性評価（0-1）
     */
    getHelpfulnessRating(): number {
        if (this.totalVotes === 0) return 0;
        return this.helpfulVotes / this.totalVotes;
    }

    /**
     * 有用性評価の追加
     * @param isHelpful - 有用フラグ
     */
    addHelpfulnessVote(isHelpful: boolean): void {
        this.totalVotes++;
        if (isHelpful) {
            this.helpfulVotes++;
        }
        this.popularity++; // 人気度も上げる
    }

    /**
     * 検索スコアの計算
     * @param query - 検索クエリ
     * @returns 検索スコア
     */
    calculateSearchScore(query: string): number {
        if (!query) return 0;
        
        const queryLower = query.toLowerCase();
        let score = 0;
        
        // 質問での一致
        if (this.question.toLowerCase().includes(queryLower)) {
            score += 10;
        }
        
        // 回答での一致
        if (this.answer.toLowerCase().includes(queryLower)) {
            score += 5;
        }
        
        // タグでの一致
        if (this.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
            score += 7;
        }
        
        // キーワードでの一致
        if (this.searchKeywords.some(keyword => keyword.toLowerCase().includes(queryLower))) {
            score += 8;
        }
        
        // 人気度ボーナス
        score += Math.min(this.popularity * 0.1, 5);
        
        // 有用性ボーナス
        score += this.getHelpfulnessRating() * 3;
        
        return score;
    }

    /**
     * 関連質問の取得
     * @param allFAQs - 全FAQ一覧
     * @returns 関連FAQ
     */
    getRelatedFAQs(allFAQs: FAQModel[]): FAQModel[] {
        const related: FAQModel[] = [];
        
        // 明示的に関連付けられた質問
        for (const relatedId of this.relatedQuestions) {
            const relatedFAQ = allFAQs.find(faq => faq.id === relatedId);
            if (relatedFAQ) {
                related.push(relatedFAQ);
            }
        }
        
        // タグベースの関連性
        if (related.length < 5) {
            const tagBasedRelated = allFAQs.filter(faq => 
                faq.id !== this.id &&
                faq.category === this.category &&
                faq.tags.some(tag => this.tags.includes(tag))
            ).sort((a, b) => b.popularity - a.popularity);
            
            related.push(...tagBasedRelated.slice(0, 5 - related.length));
        }
        
        return related;
    }

    /**
     * JSON形式での出力
     * @returns JSON形式のデータ
     */
    toJSON(): Record<string, any> {
        return {
            id: this.id,
            question: this.question,
            answer: this.answer,
            category: this.category,
            tags: this.tags,
            language: this.language,
            popularity: this.popularity,
            lastUpdated: this.lastUpdated,
            relatedQuestions: this.relatedQuestions,
            helpfulVotes: this.helpfulVotes,
            totalVotes: this.totalVotes,
            difficulty: this.difficulty,
            searchKeywords: this.searchKeywords,
            metadata: this.metadata
        };
    }
}

/**
 * ユーザー進捗モデル
 */
export class UserProgressModel {
    public userId: string;
    public completedTutorials: Set<string>;
    public viewedHelpSections: Set<string>;
    public searchHistory: SearchHistoryEntry[];
    public preferences: UserPreferences;
    public lastActivity: number;
    public statistics: UserStatistics;
    public achievements: Set<string>;

    constructor(data: Partial<UserProgressModel> & { 
        completedTutorials?: string[] | Set<string>;
        viewedHelpSections?: string[] | Set<string>;
        achievements?: string[] | Set<string>;
        preferences?: Partial<UserPreferences>;
        statistics?: Partial<UserStatistics>;
    } = {}) {
        this.userId = data.userId || '';
        this.completedTutorials = data.completedTutorials instanceof Set ? 
            data.completedTutorials : new Set(data.completedTutorials || []);
        this.viewedHelpSections = data.viewedHelpSections instanceof Set ? 
            data.viewedHelpSections : new Set(data.viewedHelpSections || []);
        this.searchHistory = data.searchHistory || [];
        this.preferences = {
            showTooltips: true,
            tutorialSpeed: 'normal',
            helpLanguage: 'ja',
            ...data.preferences
        };
        this.lastActivity = data.lastActivity || Date.now();
        this.statistics = {
            totalHelpViews: 0,
            totalSearches: 0,
            totalTutorialsCompleted: 0,
            timeSpentInHelp: 0,
            ...data.statistics
        };
        this.achievements = data.achievements instanceof Set ? 
            data.achievements : new Set(data.achievements || []);
    }

    /**
     * データの検証
     * @returns 検証結果
     */
    validate(): boolean {
        try {
            // 必須フィールドの確認
            if (!this.userId) {
                return false;
            }

            // 設定の確認
            if (!this.preferences || typeof this.preferences !== 'object') {
                return false;
            }

            // 統計データの確認
            if (!this.statistics || typeof this.statistics !== 'object') {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * チュートリアル完了の記録
     * @param tutorialId - チュートリアルID
     */
    completeTutorial(tutorialId: string): void {
        if (!this.completedTutorials.has(tutorialId)) {
            this.completedTutorials.add(tutorialId);
            this.statistics.totalTutorialsCompleted++;
            this.updateLastActivity();
        }
    }

    /**
     * ヘルプセクション閲覧の記録
     * @param sectionId - セクションID
     */
    viewHelpSection(sectionId: string): void {
        if (!this.viewedHelpSections.has(sectionId)) {
            this.viewedHelpSections.add(sectionId);
        }
        this.statistics.totalHelpViews++;
        this.updateLastActivity();
    }

    /**
     * 検索履歴の追加
     * @param query - 検索クエリ
     * @param language - 言語
     */
    addSearchHistory(query: string, language: string = 'ja'): void {
        this.searchHistory.push({
            query,
            language,
            timestamp: Date.now()
        });
        
        // 最大100件の履歴を保持
        if (this.searchHistory.length > 100) {
            this.searchHistory.shift();
        }
        
        this.statistics.totalSearches++;
        this.updateLastActivity();
    }

    /**
     * 実績の解除
     * @param achievementId - 実績ID
     */
    unlockAchievement(achievementId: string): void {
        this.achievements.add(achievementId);
        this.updateLastActivity();
    }

    /**
     * 設定の更新
     * @param newPreferences - 新しい設定
     */
    updatePreferences(newPreferences: Partial<UserPreferences>): void {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.updateLastActivity();
    }

    /**
     * ヘルプ利用時間の追加
     * @param duration - 利用時間（ミリ秒）
     */
    addHelpTime(duration: number): void {
        this.statistics.timeSpentInHelp += duration;
        this.updateLastActivity();
    }

    /**
     * 進捗統計の取得
     * @returns 進捗統計
     */
    getProgressStatistics(): ProgressStatistics {
        return {
            completedTutorials: this.completedTutorials.size,
            viewedHelpSections: this.viewedHelpSections.size,
            totalSearches: this.statistics.totalSearches,
            totalHelpViews: this.statistics.totalHelpViews,
            timeSpentInHelp: this.statistics.timeSpentInHelp,
            achievements: this.achievements.size,
            lastActivity: this.lastActivity
        };
    }

    /**
     * 完了率の計算
     * @param totalTutorials - 総チュートリアル数
     * @param totalHelpSections - 総ヘルプセクション数
     * @returns 完了率情報
     */
    getCompletionRates(totalTutorials: number = 0, totalHelpSections: number = 0): CompletionRates {
        return {
            tutorialCompletionRate: totalTutorials > 0 ? (this.completedTutorials.size / totalTutorials) * 100 : 0,
            helpViewCompletionRate: totalHelpSections > 0 ? (this.viewedHelpSections.size / totalHelpSections) * 100 : 0
        };
    }

    /**
     * 検索パターンの分析
     * @returns 検索パターン分析結果
     */
    analyzeSearchPatterns(): SearchPatterns {
        const patterns: SearchPatterns = {
            commonQueries: {},
            languageDistribution: {},
            timeDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 }
        };

        for (const search of this.searchHistory) {
            // よく使われるクエリ
            patterns.commonQueries[search.query] = (patterns.commonQueries[search.query] || 0) + 1;
            
            // 言語分布
            patterns.languageDistribution[search.language] = (patterns.languageDistribution[search.language] || 0) + 1;
            
            // 時間帯分布
            const hour = new Date(search.timestamp).getHours();
            if (hour >= 6 && hour < 12) patterns.timeDistribution.morning++;
            else if (hour >= 12 && hour < 18) patterns.timeDistribution.afternoon++;
            else if (hour >= 18 && hour < 22) patterns.timeDistribution.evening++;
            else patterns.timeDistribution.night++;
        }

        return patterns;
    }

    /**
     * 最終活動時刻の更新
     */
    updateLastActivity(): void {
        this.lastActivity = Date.now();
    }

    /**
     * JSON形式での出力（機密データを除く）
     * @returns JSON形式のデータ
     */
    toJSON(): Record<string, any> {
        return {
            userId: this.userId,
            completedTutorials: Array.from(this.completedTutorials),
            viewedHelpSections: Array.from(this.viewedHelpSections),
            searchHistory: this.searchHistory.slice(-20), // 最新20件のみ
            preferences: this.preferences,
            lastActivity: this.lastActivity,
            statistics: this.statistics,
            achievements: Array.from(this.achievements)
        };
    }

    /**
     * ローカルストレージ用の軽量データ
     * @returns 軽量データ
     */
    toLightweightData(): Record<string, any> {
        return {
            userId: this.userId,
            completedTutorials: Array.from(this.completedTutorials),
            preferences: this.preferences,
            lastActivity: this.lastActivity,
            achievements: Array.from(this.achievements)
        };
    }
}

/**
 * データモデルファクトリー
 */
export class DataModelFactory {
    /**
     * データタイプに応じたモデルインスタンスを作成
     * @param type - データタイプ
     * @param data - データ
     * @returns モデルインスタンス
     */
    static create(type: string, data: any): HelpContentModel | TutorialModel | FAQModel | UserProgressModel {
        switch (type) {
            case 'help':
            case 'helpContent':
                return new HelpContentModel(data);
            case 'tutorial':
                return new TutorialModel(data);
            case 'faq':
                return new FAQModel(data);
            case 'userProgress':
                return new UserProgressModel(data);
            default:
                throw new Error(`Unknown data model type: ${type}`);
        }
    }

    /**
     * 複数のモデルを一括作成
     * @param type - データタイプ
     * @param dataArray - データ配列
     * @returns モデルインスタンス配列
     */
    static createBatch(type: string, dataArray: any[]): (HelpContentModel | TutorialModel | FAQModel | UserProgressModel)[] {
        if (!Array.isArray(dataArray)) {
            throw new Error('Data must be an array for batch creation');
        }

        return dataArray.map(data => this.create(type, data)).filter(model => model.validate());
    }

    /**
     * サポートされているモデルタイプ一覧を取得
     * @returns サポートタイプ一覧
     */
    static getSupportedTypes(): string[] {
        return ['help', 'helpContent', 'tutorial', 'faq', 'userProgress'];
    }
}