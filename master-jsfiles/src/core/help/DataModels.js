/**
 * DataModels.js
 * ヘルプシステムで使用するデータモデルクラス
 * HelpContent, Tutorial, FAQ, UserProgress の各モデルを定義
 */

/**
 * ヘルプコンテンツモデル
 */
export class HelpContentModel {
    constructor(data = {}) {
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
     * @returns {boolean} 検証結果
     */
    validate() {
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
     * @param {string} sectionId - セクションID
     * @returns {Object|null} セクションデータ
     */
    getSection(sectionId) {
        return this.sections.find(section => section.id === sectionId) || null;
    }

    /**
     * タグによるフィルタリング
     * @param {Array} tags - フィルター対象タグ
     * @returns {Array} マッチするセクション
     */
    filterByTags(tags) {
        if (!tags || tags.length === 0) return this.sections;
        
        return this.sections.filter(section => 
            section.tags && section.tags.some(tag => tags.includes(tag))
        );
    }

    /**
     * 難易度によるフィルタリング
     * @param {string} difficulty - 難易度
     * @returns {Array} マッチするセクション
     */
    filterByDifficulty(difficulty) {
        return this.sections.filter(section => section.difficulty === difficulty);
    }

    /**
     * 検索
     * @param {string} query - 検索クエリ
     * @returns {Array} 検索結果
     */
    search(query) {
        if (!query) return [];
        
        const queryLower = query.toLowerCase();
        const results = [];
        
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
     * @returns {Object} JSON形式のデータ
     */
    toJSON() {
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
    constructor(data = {}) {
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
     * @returns {boolean} 検証結果
     */
    validate() {
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
     * @param {string} stepId - ステップID
     * @returns {Object|null} ステップデータ
     */
    getStep(stepId) {
        return this.steps.find(step => step.id === stepId) || null;
    }

    /**
     * インデックスによるステップ取得
     * @param {number} index - ステップインデックス
     * @returns {Object|null} ステップデータ
     */
    getStepByIndex(index) {
        if (index < 0 || index >= this.steps.length) {
            return null;
        }
        return this.steps[index];
    }

    /**
     * 次のステップ取得
     * @param {string} currentStepId - 現在のステップID
     * @returns {Object|null} 次のステップ
     */
    getNextStep(currentStepId) {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex === -1 || currentIndex >= this.steps.length - 1) {
            return null;
        }
        return this.steps[currentIndex + 1];
    }

    /**
     * 前のステップ取得
     * @param {string} currentStepId - 現在のステップID
     * @returns {Object|null} 前のステップ
     */
    getPreviousStep(currentStepId) {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex <= 0) {
            return null;
        }
        return this.steps[currentIndex - 1];
    }

    /**
     * 進捗率の計算
     * @param {string} currentStepId - 現在のステップID
     * @returns {number} 進捗率（0-100）
     */
    getProgress(currentStepId) {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        if (currentIndex === -1) return 0;
        
        return Math.round(((currentIndex + 1) / this.steps.length) * 100);
    }

    /**
     * 完了チェック
     * @param {string} currentStepId - 現在のステップID
     * @returns {boolean} 完了フラグ
     */
    isCompleted(currentStepId) {
        const currentIndex = this.steps.findIndex(step => step.id === currentStepId);
        return currentIndex === this.steps.length - 1;
    }

    /**
     * 前提条件チェック
     * @param {Set} completedTutorials - 完了済みチュートリアル
     * @returns {boolean} 前提条件満たしフラグ
     */
    checkPrerequisites(completedTutorials) {
        if (!this.prerequisites || this.prerequisites.length === 0) {
            return true;
        }
        
        return this.prerequisites.every(prereq => completedTutorials.has(prereq));
    }

    /**
     * JSON形式での出力
     * @returns {Object} JSON形式のデータ
     */
    toJSON() {
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
    constructor(data = {}) {
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
     * @returns {boolean} 検証結果
     */
    validate() {
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
     * @returns {number} 有用性評価（0-1）
     */
    getHelpfulnessRating() {
        if (this.totalVotes === 0) return 0;
        return this.helpfulVotes / this.totalVotes;
    }

    /**
     * 有用性評価の追加
     * @param {boolean} isHelpful - 有用フラグ
     */
    addHelpfulnessVote(isHelpful) {
        this.totalVotes++;
        if (isHelpful) {
            this.helpfulVotes++;
        }
        this.popularity++; // 人気度も上げる
    }

    /**
     * 検索スコアの計算
     * @param {string} query - 検索クエリ
     * @returns {number} 検索スコア
     */
    calculateSearchScore(query) {
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
     * @param {Array} allFAQs - 全FAQ一覧
     * @returns {Array} 関連FAQ
     */
    getRelatedFAQs(allFAQs) {
        const related = [];
        
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
     * @returns {Object} JSON形式のデータ
     */
    toJSON() {
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
    constructor(data = {}) {
        this.userId = data.userId || '';
        this.completedTutorials = new Set(data.completedTutorials || []);
        this.viewedHelpSections = new Set(data.viewedHelpSections || []);
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
        this.achievements = new Set(data.achievements || []);
    }

    /**
     * データの検証
     * @returns {boolean} 検証結果
     */
    validate() {
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
     * @param {string} tutorialId - チュートリアルID
     */
    completeTutorial(tutorialId) {
        if (!this.completedTutorials.has(tutorialId)) {
            this.completedTutorials.add(tutorialId);
            this.statistics.totalTutorialsCompleted++;
            this.updateLastActivity();
        }
    }

    /**
     * ヘルプセクション閲覧の記録
     * @param {string} sectionId - セクションID
     */
    viewHelpSection(sectionId) {
        if (!this.viewedHelpSections.has(sectionId)) {
            this.viewedHelpSections.add(sectionId);
        }
        this.statistics.totalHelpViews++;
        this.updateLastActivity();
    }

    /**
     * 検索履歴の追加
     * @param {string} query - 検索クエリ
     * @param {string} language - 言語
     */
    addSearchHistory(query, language = 'ja') {
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
     * @param {string} achievementId - 実績ID
     */
    unlockAchievement(achievementId) {
        this.achievements.add(achievementId);
        this.updateLastActivity();
    }

    /**
     * 設定の更新
     * @param {Object} newPreferences - 新しい設定
     */
    updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        this.updateLastActivity();
    }

    /**
     * ヘルプ利用時間の追加
     * @param {number} duration - 利用時間（ミリ秒）
     */
    addHelpTime(duration) {
        this.statistics.timeSpentInHelp += duration;
        this.updateLastActivity();
    }

    /**
     * 進捗統計の取得
     * @returns {Object} 進捗統計
     */
    getProgressStatistics() {
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
     * @param {number} totalTutorials - 総チュートリアル数
     * @param {number} totalHelpSections - 総ヘルプセクション数
     * @returns {Object} 完了率情報
     */
    getCompletionRates(totalTutorials = 0, totalHelpSections = 0) {
        return {
            tutorialCompletionRate: totalTutorials > 0 ? (this.completedTutorials.size / totalTutorials) * 100 : 0,
            helpViewCompletionRate: totalHelpSections > 0 ? (this.viewedHelpSections.size / totalHelpSections) * 100 : 0
        };
    }

    /**
     * 検索パターンの分析
     * @returns {Object} 検索パターン分析結果
     */
    analyzeSearchPatterns() {
        const patterns = {
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
    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    /**
     * JSON形式での出力（機密データを除く）
     * @returns {Object} JSON形式のデータ
     */
    toJSON() {
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
     * @returns {Object} 軽量データ
     */
    toLightweightData() {
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
     * @param {string} type - データタイプ
     * @param {Object} data - データ
     * @returns {Object} モデルインスタンス
     */
    static create(type, data) {
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
     * @param {string} type - データタイプ
     * @param {Array} dataArray - データ配列
     * @returns {Array} モデルインスタンス配列
     */
    static createBatch(type, dataArray) {
        if (!Array.isArray(dataArray)) {
            throw new Error('Data must be an array for batch creation');
        }

        return dataArray.map(data => this.create(type, data)).filter(model => model.validate());
    }

    /**
     * サポートされているモデルタイプ一覧を取得
     * @returns {Array} サポートタイプ一覧
     */
    static getSupportedTypes() {
        return ['help', 'helpContent', 'tutorial', 'faq', 'userProgress'];
    }
}