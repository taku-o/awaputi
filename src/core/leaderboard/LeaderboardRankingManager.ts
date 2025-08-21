/**
 * LeaderboardRankingManager
 * リーダーボードのランキング計算、期間別ランキング管理を担当
 */

// 型定義
export interface LeaderboardManager { data: LeaderboardData;
    config: LeaderboardConfig;
    clearRelevantCache: (leaderboardKey: string) => void  }
}

export interface LeaderboardData { leaderboards: Record<string, Leaderboard>,
    periodLeaderboards?: PeriodLeaderboards;
    statistics?: LeaderboardStatistics;
    cache?: LeaderboardCache;

export interface Leaderboard { entries: ScoreEntry[];
    lastUpdated: number;
    metadata?: LeaderboardMetadata;

export interface ScoreEntry { playerName: string;
    score: number;
    timestamp: number;
    stageId?: string;
    difficulty?: string;
    playTime?: number;
    achievements?: string[];
    rank?: number;
    period?: PeriodType;
    periodKey?: string;

export interface LeaderboardConfig { maxEntries?: number,
    maxPeriodEntries?: number;
    enablePeriodRankings?: boolean;
    sortCriteria?: SortCriteria;
    rankingUpdateInterval?: number;

export interface PeriodLeaderboards { daily?: Record<string, PeriodLeaderboard>,
    weekly?: Record<string, PeriodLeaderboard>;
    monthly?: Record<string, PeriodLeaderboard>;
    yearly?: Record<string, PeriodLeaderboard> }

export interface PeriodLeaderboard { entries: ScoreEntry[];
    startDate: Date;
    endDate: Date;
    metadata?: PeriodMetadata;

export interface PeriodMetadata { totalPlayers: number;
    totalScores: number;
    averageScore: number;
    highestScore: number;
    period: PeriodType;
    periodKey: string;

export interface LeaderboardMetadata { createdAt: number;
    updatedAt: number;
    totalEntries: number;
    highestScore: number;
    averageScore: number;
    uniquePlayers: number;

export interface SortCriteria { primary: SortField;
    secondary?: SortField;
    order: SortOrder;

export interface SortField { field: string;
    numeric: boolean;

export interface LeaderboardStatistics { totalPlayers: number;
    totalScores: number;
    averageScore: number;
    highestScore: number;
    period?: PeriodType;
    periodKey?: string;

export interface LeaderboardCache { rankings: Record<string, CachedRanking>,
    statistics: Record<string, CachedStatistics>;
    lastClearTime: number;

export interface CachedRanking { data: ScoreEntry[];
    timestamp: number;
    period?: PeriodType;

export interface CachedStatistics { data: LeaderboardStatistics;
    timestamp: number;
    period?: PeriodType;

export interface DateKeyComponents { year: number;
    month: number;
    day?: number;
    week?: number;

export interface PeriodRange { start: Date;
    end: Date;
    key: string;
    period: PeriodType;

export interface RankingUpdateResult { success: boolean;
    updatedEntries: number;
    newRank?: number;
    previousRank?: number;
    leaderboardKey: string;

export interface BinarySearchResult { found: boolean;
    index: number;
    exactMatch: boolean;

export interface PeriodCalculationParams { date: Date;
    period: PeriodType;
    weekStartDay?: WeekStartDay;

// 列挙型
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SortOrder = 'asc' | 'desc';

export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
export type LeaderboardType = 'global' | 'stage' | 'difficulty' | 'period';
export type RankingStatus = 'active' | 'expired' | 'calculating' | 'error';

// 定数
export const DEFAULT_MAX_ENTRIES = 100;
export const DEFAULT_MAX_PERIOD_ENTRIES = 50;
export const DEFAULT_WEEK_START_DAY: WeekStartDay = 0, // Sunday
export const DEFAULT_RANKING_LIMIT = 10;
export const CACHE_EXPIRY_TIME = 300000; // 5 minutes

export const, PERIOD_TYPES: PeriodType[] = ['daily', 'weekly', 'monthly', 'yearly'];
';'

export const DEFAULT_SORT_CRITERIA: SortCriteria = { }'

    primary: { field: 'score', numeric: true,,''
    secondary: { field: 'timestamp', numeric: true,,''
    order: 'desc';
},

export const DATE_KEY_FORMATS = {;
    daily: 'YYYY-MM-DD';
    weekly: 'YYYY-WMM-DD';
    monthly: 'YYYY-MM';
    yearly: 'YYYY'
            } as const;
// ユーティリティ関数
export function isValidPeriodType(period: string): period is PeriodType { return PERIOD_TYPES.includes(period, as PeriodType) }

export function isValidScoreEntry(entry: any): entry is ScoreEntry { return entry &&''
           typeof entry.playerName === 'string' &&','
           typeof entry.score === 'number' &&','
           typeof entry.timestamp === 'number' }

export function isValidDate(date: any): date is Date { return date instanceof Date && !isNaN(date.getTime() }
';'

export function isValidLeaderboard(leaderboard: any): leaderboard is Leaderboard { return leaderboard &&''
           Array.isArray(leaderboard.entries) &&','
           typeof leaderboard.lastUpdated === 'number' }

export function clampEntryCount(count: number, maxEntries: number = DEFAULT_MAX_ENTRIES): number { return Math.max(0, Math.min(count, maxEntries) }

export function calculateAverageScore(scores: number[]): number { return scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,

export function getUniquePlayersCount(entries: ScoreEntry[]): number { return new Set(entries.map(entry => entry.playerName).size;
','

export function formatDateKey(date: Date, period: PeriodType, weekStartDay: WeekStartDay = DEFAULT_WEEK_START_DAY): string { const year = date.getFullYear();
    const month = String(date.getMonth() + 1').padStart(2, '0','
    const day = String(date.getDate()).padStart(2, '0),'

    switch(period) {', ' }

        case 'daily': }

            return `${year}-${month}-${day}`;
        case 'weekly':';'
            const weekStart = getWeekStart(date, weekStartDay);
            const weekMonth = String(weekStart.getMonth() + 1').padStart(2, '0';'
            const weekDay = String(weekStart.getDate()).padStart(2, '0';
            return `${ weekStart.getFullYear('''
        case 'monthly': }

            return `${year}-${month}`;
        case 'yearly':
            return `${year}`;
        default: );
            return `${year}-${month}-${day}`)
    }
}
);
export function getWeekStart(date: Date, weekStartDay: WeekStartDay = DEFAULT_WEEK_START_DAY): Date { const d = new Date(date);
    const day = d.getDay();
    const diff = (day - weekStartDay + 7) % 7,
    return new Date(d.setDate(d.getDate() - diff)) }

export function parseDateKey(key: string, period: PeriodType): Date | null { try {'
        const parts = key.split('-),'

        switch(period) {

            case 'daily':','
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])),
            case 'weekly':','
                // 簡化实现：使用键的日期
                return new Date(parseInt(parts[0]), parseInt(parts[1].slice(1) - 1, parseInt(parts[2])),
            case 'monthly':','
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1'),'
            case 'yearly':,
                return new Date(parseInt(parts[0]), 0, 1) }
            default: return null; catch (error) { return null,

export function createDefaultLeaderboard(): Leaderboard { return { entries: [];
        lastUpdated: Date.now(
    metadata: {
            createdAt: Date.now();
            updatedAt: Date.now();
            totalEntries: 0;
            highestScore: 0;
    averageScore: 0 };
            uniquePlayers: 0 
    }

export class LeaderboardRankingManager {
    private leaderboardManager: LeaderboardManager;
    constructor(leaderboardManager: LeaderboardManager) {
        this.leaderboardManager = leaderboardManager }

    /**
     * リーダーボードの更新
     */
    updateLeaderboards(leaderboardKey: string, scoreEntry: ScoreEntry): RankingUpdateResult { try {
            const data = this.leaderboardManager.data,
            
            if (!data.leaderboards[leaderboardKey]) {
    
}
                data.leaderboards[leaderboardKey] = createDefaultLeaderboard(); }
            }

            const leaderboard = data.leaderboards[leaderboardKey];
            const previousRank = this.findPlayerRank(leaderboard, scoreEntry.playerName);
            
            // エントリを追加
            leaderboard.entries.push(scoreEntry);
            
            // ソート（スコア降順）
            this.sortLeaderboard(leaderboard);
            
            // 最大エントリ数の制限
            const maxEntries = this.leaderboardManager.config.maxEntries || DEFAULT_MAX_ENTRIES;
            if (leaderboard.entries.length > maxEntries) { leaderboard.entries = leaderboard.entries.slice(0, maxEntries) }
            
            leaderboard.lastUpdated = Date.now();
            
            // メタデータの更新
            this.updateLeaderboardMetadata(leaderboard);
            
            // キャッシュクリア
            this.leaderboardManager.clearRelevantCache(leaderboardKey);

            const newRank = this.findPlayerRank(leaderboard, scoreEntry.playerName);

            return { success: true;
                updatedEntries: leaderboard.entries.length;
                newRank,
                previousRank };
                leaderboardKey }
            } catch (error) {
            console.error('[LeaderboardRankingManager] Error updating leaderboard:', error','
            return { success: false,
                updatedEntries: 0 },
                leaderboardKey }
            }
    }

    /**
     * 期間別リーダーボードの更新
     */'
    updatePeriodLeaderboards(scoreEntry: ScoreEntry): void { ''
        if(!isValidScoreEntry(scoreEntry)) {''
            console.error('[LeaderboardRankingManager] Invalid, score entry, provided),'
            return }

        const data = this.leaderboardManager.data;
        const now = new Date(scoreEntry.timestamp);

        try { // 各期間での更新
            this.updateDailyLeaderboard(data, scoreEntry, now);
            this.updateWeeklyLeaderboard(data scoreEntry now'),'
            this.updateMonthlyLeaderboard(data, scoreEntry, now'),' }'

        } catch (error) { console.error('[LeaderboardRankingManager] Error updating period leaderboards:', error }
    }

    /**
     * 日別リーダーボードの更新'
     */''
    private updateDailyLeaderboard(data: LeaderboardData, scoreEntry: ScoreEntry, date: Date): void { ''
        const dateKey = formatDateKey(date, 'daily');
        this.updatePeriodBoard(data, 'daily', dateKey, scoreEntry' }'

    /**
     * 週別リーダーボードの更新'
     */''
    private updateWeeklyLeaderboard(data: LeaderboardData, scoreEntry: ScoreEntry, date: Date): void { ''
        const weekKey = formatDateKey(date, 'weekly');
        this.updatePeriodBoard(data, 'weekly', weekKey, scoreEntry' }'

    /**
     * 月別リーダーボードの更新'
     */''
    private updateMonthlyLeaderboard(data: LeaderboardData, scoreEntry: ScoreEntry, date: Date): void { ''
        const monthKey = formatDateKey(date, 'monthly');
        this.updatePeriodBoard(data, 'monthly', monthKey, scoreEntry) }

    /**
     * 期間別ボードの更新
     */
    private updatePeriodBoard(data: LeaderboardData, period: PeriodType, key: string, scoreEntry: ScoreEntry): void { if (!data.periodLeaderboards) { }
            data.periodLeaderboards = {}

        if (!data.periodLeaderboards[period]) {
    
}
            data.periodLeaderboards[period] = {}

        if (!data.periodLeaderboards[period]![key]) {

            data.periodLeaderboards[period]![key] = {
                entries: [],
    startDate: this.getPeriodStartDate(key, period) || new Date() }
                endDate: this.getPeriodEndDate(key, period) || new Date(); }
            }

        const periodBoard = data.periodLeaderboards[period]![key];
        periodBoard.entries.push(scoreEntry);
        
        // ソート
        this.sortLeaderboard(periodBoard);
        
        // 制限
        const maxEntries = this.leaderboardManager.config.maxPeriodEntries || DEFAULT_MAX_PERIOD_ENTRIES;
        if (periodBoard.entries.length > maxEntries) { periodBoard.entries = periodBoard.entries.slice(0, maxEntries) }
    }

    /**
     * 期間別ランキングの取得
     */
    getPeriodRanking(period: PeriodType, limit: number = DEFAULT_RANKING_LIMIT): ScoreEntry[] { ''
        if(!isValidPeriodType(period)) {''
            console.error('[LeaderboardRankingManager] Invalid period type:', period);
            return [] }

        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards || !data.periodLeaderboards[period]) { return [] }

        const periodData = data.periodLeaderboards[period]!;
        const currentKey = this.getCurrentPeriodKey(period);
        
        if (!periodData[currentKey] || !periodData[currentKey].entries) { return [] }

        const entries = periodData[currentKey].entries.slice(0, clampEntryCount(limit);
        
        // ランキング情報の付加
        return entries.map((entry, index) => ({ ...entry,
            rank: index + 1,
            period: period,
    periodKey: currentKey,);
    }

    /**
     * 期間統計の取得
     */
    getPeriodStats(period: PeriodType): LeaderboardStatistics { if (!isValidPeriodType(period) {
            return this.createEmptyStats(period) }

        const data = this.leaderboardManager.data;
        
        if (!data.periodLeaderboards || !data.periodLeaderboards[period]) { return this.createEmptyStats(period) }

        const periodData = data.periodLeaderboards[period]!;
        const currentKey = this.getCurrentPeriodKey(period);
        
        if (!periodData[currentKey] || !periodData[currentKey].entries) { return this.createEmptyStats(period) }

        const entries = periodData[currentKey].entries;
        const uniquePlayers = getUniquePlayersCount(entries);
        const scores = entries.map(entry => entry.score);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);

        return { totalPlayers: uniquePlayers,
            totalScores: entries.length,
            averageScore: calculateAverageScore(scores);
            highestScore: entries.length > 0 ? Math.max(...scores) : 0,
            period: period,
            periodKey: currentKey,

    /**
     * 期間別ランキングの再計算
     */
    recalculatePeriodRankings(): void { const data = this.leaderboardManager.data,

        if (!data.periodLeaderboards) {
    
}
            return; }
        }

        const periods: PeriodType[] = ['daily', 'weekly', 'monthly'];
        
        for (const period of periods) {
        
            if (data.periodLeaderboards[period]) {
                for(const [key, board] of Object.entries(data.periodLeaderboards[period]!) {
                    if (isValidLeaderboard(board) {
    
}

                        this.sortLeaderboard(board); }
}
            }
        }

        console.log('[LeaderboardRankingManager] Period, rankings recalculated);'
    }

    /**
     * リーダーボードのソート
     */
    sortLeaderboard(leaderboard: Leaderboard | PeriodLeaderboard): void { if (!leaderboard.entries || !Array.isArray(leaderboard.entries) {
            return }

        leaderboard.entries.sort((a, b) => {  // スコア降順
            if (b.score !== a.score) { }
                return b.score - a.score;
            // スコアが同じ場合、タイムスタンプ昇順（早い方が上位）
            return a.timestamp - b.timestamp;

    /**
     * 日付キーのフォーマット
     */
    formatDateKey(date: Date, period: PeriodType): string { return formatDateKey(date, period) }

    /**
     * 現在の期間キーの取得
     */
    getCurrentPeriodKey(period: PeriodType): string { const now = new Date();
        return this.formatDateKey(now, period) }

    /**
     * 週の開始日を取得
     */
    getWeekStart(date: Date): Date { return getWeekStart(date) }

    /**
     * 期間の開始日を取得
     */
    getPeriodStartDate(key: string, period: PeriodType): Date | null { return parseDateKey(key, period) }

    /**
     * 期間の終了日を取得
     */
    getPeriodEndDate(key: string period: PeriodType): Date | null { const startDate = this.getPeriodStartDate(key period'),'
        if (!startDate) return null,

        switch(period') {'

            case 'daily':','
                const endOfDay = new Date(startDate);
                endOfDay.setHours(23, 59, 59, 999);
                return endOfDay,
            case 'weekly':,
                const endOfWeek = new Date(startDate);
                endOfWeek.setDate(endOfWeek.getDate() + 6),
                endOfWeek.setHours(23, 59, 59, 999);
                return endOfWeek,
            case 'monthly':','
                const endOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0),
                endOfMonth.setHours(23, 59, 59, 999);
                return endOfMonth,
            case 'yearly':,
                const endOfYear = new Date(startDate.getFullYear(), 11, 31, 23, 59, 59, 999),
                return endOfYear }
            default: return new Date();
    /**
     * 効率的なランキング更新
     */
    updateRankingEfficiently(leaderboardKey: string, newEntry: ScoreEntry): boolean { if (!isValidScoreEntry(newEntry) {
            return false }

        const data = this.leaderboardManager.data;
        const leaderboard = data.leaderboards[leaderboardKey];
        
        if (!leaderboard || !leaderboard.entries) { return false }

        const entries = leaderboard.entries;
        const insertIndex = this.findInsertionIndex(entries, newEntry);

        // 指定位置に挿入
        entries.splice(insertIndex, 0, newEntry);

        // 最大エントリ数の制限
        const maxEntries = this.leaderboardManager.config.maxEntries || DEFAULT_MAX_ENTRIES;
        if (entries.length > maxEntries) { entries.splice(maxEntries) }

        leaderboard.lastUpdated = Date.now();
        this.updateLeaderboardMetadata(leaderboard);
        
        return true;
    }

    /**
     * 挿入位置の検索（バイナリサーチ）
     */
    private findInsertionIndex(entries: ScoreEntry[], newEntry: ScoreEntry): number { let left = 0,
        let right = entries.length,

        while(left < right) {

            const mid = Math.floor((left + right) / 2),
            const midEntry = entries[mid],

            if(midEntry.score < newEntry.score || );
                (midEntry.score === newEntry.score && midEntry.timestamp > newEntry.timestamp) {
    
}
                right = mid; }
            } else { left = mid + 1 }
        }

        return left;
    }

    /**
     * プレイヤーのランクを検索
     */
    private findPlayerRank(leaderboard: Leaderboard, playerName: string): number | undefined { const index = leaderboard.entries.findIndex(entry => entry.playerName === playerName);
        return index >= 0 ? index + 1 : undefined;

    /**
     * リーダーボードメタデータの更新
     */
    private updateLeaderboardMetadata(leaderboard: Leaderboard): void { if (!leaderboard.metadata) {
            leaderboard.metadata = {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                totalEntries: 0,
                highestScore: 0,
                averageScore: 0,
    uniquePlayers: 0 }

        const entries = leaderboard.entries;
        const scores = entries.map(entry => entry.score);

        leaderboard.metadata.updatedAt = Date.now();
        leaderboard.metadata.totalEntries = entries.length;
        leaderboard.metadata.highestScore = entries.length > 0 ? Math.max(...scores) : 0;
        leaderboard.metadata.averageScore = calculateAverageScore(scores);
        leaderboard.metadata.uniquePlayers = getUniquePlayersCount(entries);
    }

    /**
     * 空の統計情報を作成
     */
    private createEmptyStats(period: PeriodType): LeaderboardStatistics { return { totalPlayers: 0,
            totalScores: 0,
            averageScore: 0,
    highestScore: 0 },
            period: period,

    /**
     * ランキングデータの検証
     */
    validateLeaderboard(leaderboard: Leaderboard): boolean { return isValidLeaderboard(leaderboard) &&
               leaderboard.entries.every(entry => isValidScoreEntry(entry);
    /**
     * 期間範囲の取得
     */
    getPeriodRange(period: PeriodType, date: Date = new Date(): PeriodRange { const key = formatDateKey(date, period);
        const start = this.getPeriodStartDate(key, period) || date,
        const end = this.getPeriodEndDate(key, period) || date }
        return { start, end, key, period }

    /**
     * 統計情報の集計
     */
    aggregateStatistics(entries: ScoreEntry[]): LeaderboardStatistics { const scores = entries.map(entry => entry.score);
        const uniquePlayers = getUniquePlayersCount(entries);
        return { totalPlayers: uniquePlayers,
            totalScores: entries.length,
    averageScore: calculateAverageScore(scores),' };'

            highestScore: entries.length > 0 ? Math.max(...scores) : 0 
        }'}'