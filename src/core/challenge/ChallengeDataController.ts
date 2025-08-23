/**
 * ChallengeDataController
 * 
 * チャレンジデータ管理システム機能を担当
 * Challenge Management Controller Patternの一部として設計
 * 
 * **Features**:
 * - Challenge data management and validation
 * - Progress tracking and statistics
 * - Auto-refresh and real-time updates
 * - Data import/export capabilities
 * 
 * @module ChallengeDataController
 * Created: Phase G.4 (Issue #103)
 */

// 型定義
export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    difficulty: ChallengeDifficulty;
    progress: number;
    target: number;
    reward: ChallengeReward;
    deadline: Date;
    priority: number;
    metadata?: ChallengeMetadata;
}

export interface ChallengeReward {
    ap?: number;
    title?: string;
    items?: RewardItem[];
    badges?: string[];
}

export interface RewardItem {
    type: string;
    id: string;
    quantity: number;
    name?: string;
}

export interface ChallengeMetadata {
    category?: string;
    tags?: string[];
    source?: string;
    version?: string;
    conditions?: ChallengeCondition[];
    customProperties?: Record<string, any>;
}

export interface ChallengeCondition {
    type: ConditionType;
    parameter: string;
    value: number | string | boolean;
    operator?: ComparisonOperator;
}

export interface ChallengeValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface ChallengeStatistics {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
    averageProgress: number;
    byType: Record<ChallengeType, number>;
    byDifficulty: Record<ChallengeDifficulty, number>;
}

export interface ChallengeFilterOptions {
    type?: ChallengeType | 'all';
    difficulty?: ChallengeDifficulty | 'all';
    status?: ChallengeStatus | 'all';
    searchQuery?: string;
}

export interface ChallengeSortOptions {
    field: ChallengeSortField;
    order: SortOrder;
}

export interface ChallengeImportResult {
    success: boolean;
    imported: number;
    errors?: Array<{ index: number; errors: string[]; }>;
    error?: string;
}

export interface ChallengeExportData {
    challenges: Challenge[];
    statistics: ChallengeStatistics;
    exportDate: string;
    version: string;
}

export interface DataIntegrityResult {
    isValid: boolean;
    issues: string[];
}

export interface ChallengeProgressUpdate {
    challengeId: string;
    oldProgress: number;
    newProgress: number;
    completed: boolean;
    timestamp: Date;
}

export interface ChallengeDataControllerConfig {
    refreshInterval: number;
    autoRefresh: boolean;
    enableProgressAnnouncements: boolean;
    enableRewardAnnouncements: boolean;
    validateOnImport: boolean;
}

export interface ChallengeDataControllerState {
    challenges: Challenge[];
    loading: boolean;
    visible: boolean;
    filterBy: string;
    sortBy: ChallengeSortField;
    searchQuery: string;
    lastUpdated?: Date;
}

export interface ChallengeUIReference {
    config: ChallengeDataControllerConfig;
    state: ChallengeDataControllerState;
    stats: ChallengeStats;
    renderer: ChallengeRenderer;
    interactionHandler: ChallengeInteractionHandler;
    challengeSystem?: ChallengeSystem;
    announce: (message: string, priority?: AnnouncementPriority) => void;
    handleError: (errorCode: string, error: Error) => void;
    log: (action: string, data?: Record<string, any>) => void;
}

export interface ChallengeRenderer {
    showLoading: (show: boolean) => void;
    renderChallenges: () => void;
    updateProgressSection: () => void;
    updateFooter: () => void;
    showError: (message: string) => void;
}

export interface ChallengeInteractionHandler {
    announceProgressUpdate: (challengeId: string, progress: number) => void;
    updateFocusableElements: () => void;
}

export interface ChallengeSystem {
    getChallenges: () => Promise<Challenge[]>;
    onChallengeCompleted?: (challenge: Challenge) => void;
    onChallengeExpired?: (challenge: Challenge) => void;
}

export interface ChallengeStats {
    completions: number;
    totalChallengesViewed?: number;
    averageCompletionTime?: number;
    lastCompletedChallenge?: string;
}

export interface DemoChallenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    difficulty: ChallengeDifficulty;
    progress: number;
    target: number;
    reward: ChallengeReward;
    deadline: Date;
    priority: number;
}

export interface ChallengeSearchOptions {
    query: string;
    fields: ChallengeSearchField[];
    caseSensitive?: boolean;
    exactMatch?: boolean;
}

export interface ChallengeSearchResult {
    challenge: Challenge;
    matchedFields: ChallengeSearchField[];
    relevanceScore: number;
}

export interface ExpiredChallengeResult {
    expired: Challenge[];
    processed: number;
    notifications: string[];
}

export interface ChallengeUpdateResult {
    success: boolean;
    challenge?: Challenge;
    oldValue?: any;
    newValue?: any;
    error?: string;
}

// 列挙型
export type ChallengeType = 'daily' | 'weekly' | 'special' | 'event';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'locked';
export type ChallengeSortField = 'priority' | 'difficulty' | 'progress' | 'deadline' | 'title' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ConditionType = 'score' | 'time' | 'count' | 'streak' | 'achievement';
export type ComparisonOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
export type AnnouncementPriority = 'polite' | 'assertive' | 'off';
export type ChallengeSearchField = 'title' | 'description' | 'type' | 'difficulty' | 'tags';

// 定数
export const DEMO_CHALLENGES: DemoChallenge[] = [
    {
        id: 'daily-1',
        title: '10個のバブルをポップ',
        description: '今日中に10個のバブルをポップしよう',
        type: 'daily',
        difficulty: 'easy',
        progress: 7,
        target: 10,
        reward: { ap: 50 },
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priority: 1
    },
    {
        id: 'weekly-1',
        title: '500ポイント獲得',
        description: '今週中に500ポイントを獲得しよう',
        type: 'weekly',
        difficulty: 'medium',
        progress: 250,
        target: 500,
        reward: { ap: 200 },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 2
    },
    {
        id: 'special-1',
        title: 'コンボ10回達成',
        description: '1回のゲームで10回コンボを達成しよう',
        type: 'special',
        difficulty: 'hard',
        progress: 0,
        target: 1,
        reward: { ap: 300, title: 'コンボマスター' },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 3
    }
] as const;

export const CHALLENGE_TYPES: readonly ChallengeType[] = ['daily', 'weekly', 'special', 'event'] as const;
export const CHALLENGE_DIFFICULTIES: readonly ChallengeDifficulty[] = ['easy', 'medium', 'hard'] as const;

export const CHALLENGE_SORT_FIELDS: readonly ChallengeSortField[] = [
    'priority', 'difficulty', 'progress', 'deadline', 'title', 'type'
] as const;

export const DIFFICULTY_ORDER: Record<ChallengeDifficulty, number> = {
    easy: 1,
    medium: 2,
    hard: 3
} as const;

export const DEFAULT_CHALLENGE_CONFIG: ChallengeDataControllerConfig = {
    refreshInterval: 30000, // 30秒
    autoRefresh: true,
    enableProgressAnnouncements: true,
    enableRewardAnnouncements: true,
    validateOnImport: true
} as const;

export const VALIDATION_RULES = {
    minProgress: 0,
    minTarget: 1,
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    maxPriority: 999,
    minPriority: 1
} as const;

// ユーティリティ関数
export function isValidChallengeType(type: string): type is ChallengeType {
    return CHALLENGE_TYPES.includes(type as ChallengeType);
}

export function isValidChallengeDifficulty(difficulty: string): difficulty is ChallengeDifficulty {
    return CHALLENGE_DIFFICULTIES.includes(difficulty as ChallengeDifficulty);
}

export function calculateChallengeProgress(progress: number, target: number): number {
    return Math.min(Math.max(0, progress), target);
}

export function formatChallengeDeadline(deadline: Date): string {
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return '期限切れ';
    if (daysDiff === 0) return '今日まで';
    if (daysDiff === 1) return '明日まで';
    return `${daysDiff}日後`;
}

export function generateChallengeId(): string {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class ChallengeDataController {
    private challengeUI: ChallengeUIReference;
    private config: ChallengeDataControllerConfig;
    private state: ChallengeDataControllerState;
    private stats: ChallengeStats;
    private refreshTimer: number | null;

    constructor(challengeUI: ChallengeUIReference) {
        this.challengeUI = challengeUI;
        this.config = challengeUI.config;
        this.state = challengeUI.state;
        this.stats = challengeUI.stats;
        
        this.refreshTimer = null;

        console.log('[ChallengeDataController] Component initialized');
    }
    
    /**
     * チャレンジデータの読み込み
     */
    async loadChallenges(): Promise<void> {
        try {
            this.challengeUI.renderer.showLoading(true);
            this.state.loading = true;
            
            // チャレンジシステムからデータを取得
            let challenges: Challenge[] = [];
            if (this.challengeUI.challengeSystem && typeof this.challengeUI.challengeSystem.getChallenges === 'function') {
                challenges = await this.challengeUI.challengeSystem.getChallenges();
            } else {
                // デモデータ
                challenges = this.generateDemoChallenges();
            }
            
            // フィルター・ソートの適用
            challenges = this.filterChallenges(challenges);
            challenges = this.sortChallenges(challenges);
            
            this.state.challenges = challenges;
            this.state.lastUpdated = new Date();
            
            // UI の更新
            this.challengeUI.renderer.renderChallenges();
            this.challengeUI.renderer.updateProgressSection();
            this.challengeUI.renderer.updateFooter();
            
            this.state.loading = false;
            this.challengeUI.renderer.showLoading(false);
            
            // アナウンス
            this.challengeUI.announce(`${challenges.length}件のチャレンジを読み込みました`);
        } catch (error) {
            this.state.loading = false;
            this.challengeUI.renderer.showLoading(false);
            this.challengeUI.renderer.showError('チャレンジの読み込みに失敗しました');
            this.challengeUI.handleError('CHALLENGE_LOAD_FAILED', error as Error);
        }
    }
    
    /**
     * デモチャレンジの生成
     */
    private generateDemoChallenges(): Challenge[] {
        return DEMO_CHALLENGES.map(demo => ({
            ...demo,
            metadata: {
                category: 'demo',
                tags: [demo.type, demo.difficulty],
                source: 'demo_generator',
                version: '1.0'
            }
        }));
    }
    
    /**
     * チャレンジのフィルタリング
     */
    private filterChallenges(challenges: Challenge[]): Challenge[] {
        const filter = this.state.filterBy;

        switch (filter) {
            case 'daily':
                return challenges.filter(c => c.type === 'daily');
            case 'weekly':
                return challenges.filter(c => c.type === 'weekly');
            case 'active':
                return challenges.filter(c => c.progress < c.target);
            case 'completed':
                return challenges.filter(c => c.progress >= c.target);
            default:
                return challenges;
        }
    }
    
    /**
     * チャレンジのソート
     */
    private sortChallenges(challenges: Challenge[]): Challenge[] {
        const sortBy = this.state.sortBy;

        return [...challenges].sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return a.priority - b.priority;
                case 'difficulty':
                    return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
                case 'progress':
                    const aProgress = a.progress / a.target;
                    const bProgress = b.progress / b.target;
                    return bProgress - aProgress;
                case 'deadline':
                    return a.deadline.getTime() - b.deadline.getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });
    }
    
    /**
     * チャレンジの進捗更新
     */
    updateChallengeProgress(challengeId: string, newProgress: number): boolean {
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        if (!challenge) return false;

        const oldProgress = challenge.progress;
        challenge.progress = calculateChallengeProgress(newProgress, challenge.target);
        
        // 完了チェック
        if (challenge.progress >= challenge.target && oldProgress < challenge.target) {
            this.onChallengeCompleted(challenge);
        }
        
        // UI更新
        this.refreshChallengeDisplay();
        
        // 進捗アナウンス
        if (this.config.enableProgressAnnouncements) {
            this.challengeUI.interactionHandler.announceProgressUpdate(challengeId, challenge.progress);
        }
        
        return true;
    }
    
    /**
     * チャレンジ完了処理
     */
    private onChallengeCompleted(challenge: Challenge): void {
        this.stats.completions++;
        this.stats.lastCompletedChallenge = challenge.id;
        
        // 報酬付与の通知
        if (this.config.enableRewardAnnouncements) {
            const rewardText = this.formatReward(challenge.reward);
            this.challengeUI.announce(`「${challenge.title}」が完了しました！報酬: ${rewardText}`, 'assertive');
        }
        
        // チャレンジシステムへの通知
        if (this.challengeUI.challengeSystem?.onChallengeCompleted) {
            this.challengeUI.challengeSystem.onChallengeCompleted(challenge);
        }

        this.challengeUI.log('チャレンジ完了', { challengeId: challenge.id });
    }
    
    /**
     * チャレンジの検索
     */
    searchChallenges(query: string): Challenge[] {
        if (!query || query.trim() === '') {
            return this.state.challenges;
        }
        
        const searchTerm = query.toLowerCase().trim();
        return this.state.challenges.filter(challenge =>
            challenge.title.toLowerCase().includes(searchTerm) ||
            challenge.description.toLowerCase().includes(searchTerm) ||
            challenge.type.toLowerCase().includes(searchTerm) ||
            challenge.difficulty.toLowerCase().includes(searchTerm) ||
            (challenge.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ?? false)
        );
    }
    
    /**
     * 高度な検索
     */
    advancedSearch(options: ChallengeSearchOptions): ChallengeSearchResult[] {
        const { query, fields, caseSensitive = false, exactMatch = false } = options;
        const searchTerm = caseSensitive ? query : query.toLowerCase();
        
        return this.state.challenges
            .map(challenge => this.evaluateChallengeMatch(challenge, searchTerm, fields, caseSensitive, exactMatch))
            .filter(result => result.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    /**
     * チャレンジマッチ評価
     */
    private evaluateChallengeMatch(
        challenge: Challenge,
        searchTerm: string,
        fields: ChallengeSearchField[],
        caseSensitive: boolean,
        exactMatch: boolean
    ): ChallengeSearchResult {
        const matchedFields: ChallengeSearchField[] = [];
        let relevanceScore = 0;

        fields.forEach(field => {
            let fieldValue = '';
            let fieldWeight = 1;

            switch (field) {
                case 'title':
                    fieldValue = caseSensitive ? challenge.title : challenge.title.toLowerCase();
                    fieldWeight = 3;
                    break;
                case 'description':
                    fieldValue = caseSensitive ? challenge.description : challenge.description.toLowerCase();
                    fieldWeight = 2;
                    break;
                case 'type':
                    fieldValue = caseSensitive ? challenge.type : challenge.type.toLowerCase();
                    fieldWeight = 1;
                    break;
                case 'difficulty':
                    fieldValue = caseSensitive ? challenge.difficulty : challenge.difficulty.toLowerCase();
                    fieldWeight = 1;
                    break;
                case 'tags':
                    fieldValue = caseSensitive
                        ? (challenge.metadata?.tags?.join(', ') ?? '')
                        : (challenge.metadata?.tags?.join(', ').toLowerCase() ?? '');
                    fieldWeight = 1;
                    break;
            }

            const isMatch = exactMatch ? fieldValue === searchTerm : fieldValue.includes(searchTerm);
            if (isMatch) {
                matchedFields.push(field);
                relevanceScore += fieldWeight;
            }
        });

        return {
            challenge,
            matchedFields,
            relevanceScore
        };
    }
    
    /**
     * チャレンジデータの検証
     */
    validateChallengeData(challenge: Challenge): ChallengeValidationResult {
        const errors: string[] = [];
        
        // 必須フィールドの検証
        if (!challenge.id) errors.push('ID is required');
        if (!challenge.title) errors.push('Title is required');
        if (!challenge.description) errors.push('Description is required');
        if (!challenge.type) errors.push('Type is required');
        if (!challenge.difficulty) errors.push('Difficulty is required');
        
        // 文字列長の検証
        if (challenge.title && challenge.title.length > VALIDATION_RULES.maxTitleLength) {
            errors.push(`Title must be ${VALIDATION_RULES.maxTitleLength} characters or less`);
        }
        if (challenge.description && challenge.description.length > VALIDATION_RULES.maxDescriptionLength) {
            errors.push(`Description must be ${VALIDATION_RULES.maxDescriptionLength} characters or less`);
        }
        
        // 数値フィールドの検証
        if (typeof challenge.progress !== 'number' || challenge.progress < VALIDATION_RULES.minProgress) {
            errors.push(`Progress must be a non-negative number (>= ${VALIDATION_RULES.minProgress})`);
        }
        if (typeof challenge.target !== 'number' || challenge.target < VALIDATION_RULES.minTarget) {
            errors.push(`Target must be a positive number (>= ${VALIDATION_RULES.minTarget})`);
        }
        if (challenge.progress > challenge.target) {
            errors.push('Progress cannot exceed target');
        }
        
        // 優先度の検証
        if (typeof challenge.priority !== 'number' ||
            challenge.priority < VALIDATION_RULES.minPriority ||
            challenge.priority > VALIDATION_RULES.maxPriority) {
            errors.push(`Priority must be between ${VALIDATION_RULES.minPriority} and ${VALIDATION_RULES.maxPriority}`);
        }
        
        // 期限の検証
        if (!(challenge.deadline instanceof Date) || isNaN(challenge.deadline.getTime())) {
            errors.push('Deadline must be a valid date');
        }
        
        // タイプの検証
        if (!isValidChallengeType(challenge.type)) {
            errors.push(`Type must be one of: ${CHALLENGE_TYPES.join(', ')}`);
        }
        
        // 難易度の検証
        if (!isValidChallengeDifficulty(challenge.difficulty)) {
            errors.push(`Difficulty must be one of: ${CHALLENGE_DIFFICULTIES.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * チャレンジデータの正規化
     */
    normalizeChallengeData(challenge: Partial<Challenge>): Challenge {
        return {
            id: String(challenge.id || generateChallengeId()),
            title: String(challenge.title || '').trim(),
            description: String(challenge.description || '').trim(),
            type: isValidChallengeType(challenge.type || '') ? challenge.type : 'daily',
            difficulty: isValidChallengeDifficulty(challenge.difficulty || '') ? challenge.difficulty : 'easy',
            progress: Math.max(VALIDATION_RULES.minProgress, Number(challenge.progress || 0)),
            target: Math.max(VALIDATION_RULES.minTarget, Number(challenge.target || 1)),
            reward: challenge.reward || {},
            deadline: challenge.deadline instanceof Date ? challenge.deadline : new Date(Date.now() + 24 * 60 * 60 * 1000),
            priority: Math.max(VALIDATION_RULES.minPriority,
                      Math.min(VALIDATION_RULES.maxPriority, Number(challenge.priority || 999))),
            metadata: challenge.metadata || {
                category: 'default',
                tags: [],
                source: 'normalized',
                version: '1.0'
            }
        };
    }
    
    /**
     * チャレンジ表示の更新
     */
    refreshChallengeDisplay(): void {
        // レンダラーに委譲
        this.challengeUI.renderer.renderChallenges();
        this.challengeUI.renderer.updateProgressSection();
        this.challengeUI.renderer.updateFooter();
        
        // フォーカス可能要素の更新
        this.challengeUI.interactionHandler.updateFocusableElements();
    }
    
    /**
     * 自動更新の開始
     */
    startAutoRefresh(): void {
        if (this.refreshTimer) {
            window.clearInterval(this.refreshTimer);
        }
        
        if (this.config.autoRefresh) {
            this.refreshTimer = window.setInterval(() => {
                if (this.state.visible && !this.state.loading) {
                    this.loadChallenges();
                }
            }, this.config.refreshInterval);
        }
    }
    
    /**
     * 自動更新の停止
     */
    stopAutoRefresh(): void {
        if (this.refreshTimer) {
            window.clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    /**
     * チャレンジ統計の取得
     */
    getChallengeStatistics(): ChallengeStatistics {
        const challenges = this.state.challenges;
        const total = challenges.length;
        const completed = challenges.filter(c => c.progress >= c.target).length;
        const active = challenges.filter(c => c.progress < c.target).length;
        
        // タイプ別統計
        const byType: Record<ChallengeType, number> = challenges.reduce((acc, challenge) => {
            acc[challenge.type] = (acc[challenge.type] || 0) + 1;
            return acc;
        }, {} as Record<ChallengeType, number>);
        
        // 難易度別統計
        const byDifficulty: Record<ChallengeDifficulty, number> = challenges.reduce((acc, challenge) => {
            acc[challenge.difficulty] = (acc[challenge.difficulty] || 0) + 1;
            return acc;
        }, {} as Record<ChallengeDifficulty, number>);
        
        // 平均進捗率
        const averageProgress = total > 0
            ? challenges.reduce((sum, c) => sum + (c.progress / c.target), 0) / total * 100
            : 0;
        
        return {
            total,
            completed,
            active,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            averageProgress: Math.round(averageProgress),
            byType,
            byDifficulty
        };
    }
    
    /**
     * チャレンジデータのエクスポート
     */
    exportChallengeData(): string {
        const data: ChallengeExportData = {
            challenges: this.state.challenges,
            statistics: this.getChallengeStatistics(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * チャレンジデータのインポート
     */
    importChallengeData(jsonData: string): ChallengeImportResult {
        try {
            const data = JSON.parse(jsonData) as Partial<ChallengeExportData>;

            if (!data.challenges || !Array.isArray(data.challenges)) {
                throw new Error('Invalid challenge data format');
            }
            
            // データの検証と正規化
            const validatedChallenges: Challenge[] = [];
            const errors: Array<{ index: number; errors: string[]; }> = [];
            
            data.challenges.forEach((challenge, index) => {
                if (this.config.validateOnImport) {
                    const normalized = this.normalizeChallengeData(challenge);
                    const validation = this.validateChallengeData(normalized);
                    if (validation.isValid) {
                        validatedChallenges.push(normalized);
                    } else {
                        errors.push({ index, errors: validation.errors });
                    }
                } else {
                    validatedChallenges.push(this.normalizeChallengeData(challenge));
                }
            });
            
            if (validatedChallenges.length > 0) {
                this.state.challenges = validatedChallenges;
                this.refreshChallengeDisplay();
                this.challengeUI.announce(`${validatedChallenges.length}件のチャレンジをインポートしました`);
            }
            
            return {
                success: true,
                imported: validatedChallenges.length,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.challengeUI.handleError('CHALLENGE_IMPORT_FAILED', error as Error);
            return {
                success: false,
                imported: 0,
                error: errorMessage
            };
        }
    }
    
    /**
     * 報酬のフォーマット
     */
    private formatReward(reward: ChallengeReward): string {
        const parts: string[] = [];
        
        if (reward.ap) {
            parts.push(`${reward.ap} AP`);
        }
        if (reward.title) {
            parts.push(`称号「${reward.title}」`);
        }
        if (reward.items && reward.items.length > 0) {
            const itemTexts = reward.items.map(item =>
                `${item.name || item.id}×${item.quantity}`
            );
            parts.push(...itemTexts);
        }
        if (reward.badges && reward.badges.length > 0) {
            parts.push(`バッジ: ${reward.badges.join(', ')}`);
        }

        return parts.length > 0 ? parts.join(', ') : '報酬なし';
    }
    
    /**
     * チャレンジの優先度更新
     */
    updateChallengePriority(challengeId: string, newPriority: number): ChallengeUpdateResult {
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            return { success: false, error: 'Challenge not found' };
        }

        const oldPriority = challenge.priority;
        const clampedPriority = Math.max(VALIDATION_RULES.minPriority,
                                       Math.min(VALIDATION_RULES.maxPriority, newPriority));
        challenge.priority = clampedPriority;
        
        // 並び順が優先度の場合は再ソート
        if (this.state.sortBy === 'priority') {
            this.state.challenges = this.sortChallenges(this.state.challenges);
            this.refreshChallengeDisplay();
        }
        
        return {
            success: true,
            challenge,
            oldValue: oldPriority,
            newValue: clampedPriority
        };
    }
    
    /**
     * 期限切れチャレンジの確認
     */
    checkExpiredChallenges(): ExpiredChallengeResult {
        const now = new Date();
        const expiredChallenges = this.state.challenges.filter(
            c => c.deadline < now && c.progress < c.target
        );
        
        const notifications: string[] = [];

        if (expiredChallenges.length > 0) {
            const message = `${expiredChallenges.length}件のチャレンジが期限切れです`;
            this.challengeUI.announce(message, 'assertive');
            notifications.push(message);
            
            // 期限切れ処理
            expiredChallenges.forEach(challenge => {
                this.onChallengeExpired(challenge);
            });
        }

        return {
            expired: expiredChallenges,
            processed: expiredChallenges.length,
            notifications
        };
    }
    
    /**
     * チャレンジ期限切れ処理
     */
    private onChallengeExpired(challenge: Challenge): void {
        // チャレンジシステムへの通知
        if (this.challengeUI.challengeSystem?.onChallengeExpired) {
            this.challengeUI.challengeSystem.onChallengeExpired(challenge);
        }

        this.challengeUI.log('チャレンジ期限切れ', { challengeId: challenge.id });
    }
    
    /**
     * データ整合性チェック
     */
    validateDataIntegrity(): DataIntegrityResult {
        const issues: string[] = [];
        
        // 重複IDのチェック
        const ids = this.state.challenges.map(c => c.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            issues.push(`Duplicate challenge IDs found: ${duplicateIds.join(', ')}`);
        }
        
        // データ型の整合性
        this.state.challenges.forEach((challenge, index) => {
            const validation = this.validateChallengeData(challenge);
            if (!validation.isValid) {
                issues.push(`Challenge ${index} (${challenge.id}): ${validation.errors.join(', ')}`);
            }
        });
        
        // 論理的整合性チェック
        const futureDeadlines = this.state.challenges.filter(
            c => c.deadline.getTime() < Date.now() && c.progress >= c.target
        );
        if (futureDeadlines.length > 0) {
            issues.push(`${futureDeadlines.length} completed challenges have past deadlines`);
        }
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    
    /**
     * チャレンジフィルターの更新
     */
    updateFilter(filterBy: string): void {
        this.state.filterBy = filterBy;
        const filteredChallenges = this.filterChallenges(this.state.challenges);
        this.state.challenges = this.sortChallenges(filteredChallenges);
        this.refreshChallengeDisplay();
    }
    
    /**
     * チャレンジソートの更新
     */
    updateSort(sortBy: ChallengeSortField): void {
        this.state.sortBy = sortBy;
        this.state.challenges = this.sortChallenges(this.state.challenges);
        this.refreshChallengeDisplay();
    }
    
    /**
     * チャレンジの削除
     */
    removeChallenge(challengeId: string): boolean {
        const index = this.state.challenges.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            this.state.challenges.splice(index, 1);
            this.refreshChallengeDisplay();
            return true;
        }
        return false;
    }
    
    /**
     * チャレンジの追加
     */
    addChallenge(challenge: Partial<Challenge>): ChallengeUpdateResult {
        try {
            const normalized = this.normalizeChallengeData(challenge);
            const validation = this.validateChallengeData(normalized);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            
            this.state.challenges.push(normalized);
            this.state.challenges = this.sortChallenges(this.state.challenges);
            this.refreshChallengeDisplay();
            
            return {
                success: true,
                challenge: normalized
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    /**
     * チャレンジ情報の取得
     */
    getChallenge(challengeId: string): Challenge | null {
        return this.state.challenges.find(c => c.id === challengeId) || null;
    }
    
    /**
     * チャレンジ総数取得
     */
    getChallengeCount(): number {
        return this.state.challenges.length;
    }
    
    /**
     * アクティブなチャレンジ数取得
     */
    getActiveChallengeCount(): number {
        return this.state.challenges.filter(c => c.progress < c.target).length;
    }
    
    /**
     * 完了したチャレンジ数取得
     */
    getCompletedChallengeCount(): number {
        return this.state.challenges.filter(c => c.progress >= c.target).length;
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void {
        this.stopAutoRefresh();
        console.log('[ChallengeDataController] Component destroyed');
    }
}