/**
 * EventHistoryManager.ts
 * イベント履歴管理システム
 * EventStageManagerから分離されたイベント履歴機能
 */

interface HistorySettings { maxHistoryEntries: number,
    maxParticipationEntries: number;
    retentionDays: number;
    enableDetailedTracking: boolean;

interface Statistics { totalEventsParticipated: number,
    totalEventsCompleted: number;
    favoriteEventType: string | null;
    averageScore: number;
    bestRank: number | null;
    streakCount: number;

interface HistoryEntry { id: string,
    type: string;
    eventId?: string;
    eventName?: string;
    eventType?: string;
    achievementId?: string;
    achievementName?: string;
    timestamp: number;
    playerLevel: number;
    details?: any;
    results?: EventResults;
    context?: any;
    ranking?: RankingData;

interface ParticipationData { eventId: string,
    firstParticipation: number;
    participationCount: number;
    completionCount: number;
    bestScore: number;
    bestRank: number | null;
    lastParticipation: number;
    averageScore: number;
    totalScore: number;

interface EventResults { score: number,
    rank: number;
    completionTime: number;
    achievements?: any[];
    rewards?: any;
    difficulty?: string;
    participantCount?: number;
    personalBest?: boolean;

interface RankingData { currentRank: number,
    previousRank: number;
    improvement: number;
    totalParticipants: number;
    percentile: number;

interface Event { id: string,
    name: string;
    type: string;
    duration?: number;
    specialRules?: any;
    rewards?: any;

interface Achievement { id: string,
    name: string;
    category?: string;
    rarity?: string;
    points?: number,  }

interface Filter { type?: string,
    eventId?: string;
    startDate?: number;
    endDate?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;

interface EventTypeStats { [key: string]: number;

interface MonthlyStats { [key: string]: {
        coun,t: number,
        totalScore: number,
    averageScore: number,

interface CategoryStats { [key: string]: {
        coun,t: number,
    points: number,

interface AchievementStats { totalAchievements: number,
    totalPoints: number;
    categories: CategoryStats;

interface PersonalBests { [eventId: string]: {
        bestScor,e: number,
        bestRank: number | null,
    completionCount: number,

interface DetailedStatistics { general: Statistics,
    eventTypes: EventTypeStats;
    monthly: MonthlyStats;
    achievements: AchievementStats;
    recentActivity: HistoryEntry[];
    personalBests: PersonalBests;

interface ExportData { eventHistory: HistoryEntry[],
    participationHistory: [string, ParticipationData][];
    achievementHistory: HistoryEntry[];
    rankingHistory: HistoryEntry[];
    statistics: Statistics;
    exportDate: number;

export class EventHistoryManager {
    private gameEngine: any;
    private eventHistory: HistoryEntry[] = [];
    private, participationHistory: Map<string, ParticipationData> = new Map(),
    private achievementHistory: HistoryEntry[] = [];
    private rankingHistory: HistoryEntry[] = [];
    private settings: HistorySettings;
    private, statistics: Statistics,
    constructor(gameEngine: any) {

        this.gameEngine = gameEngine;
        
        // 履歴データ
        this.eventHistory = [];
        this.participationHistory = new Map();
        this.achievementHistory = [];
        this.rankingHistory = [];
        
        // 履歴設定
        this.settings = {
            maxHistoryEntries: 1000,
            maxParticipationEntries: 500,
    retentionDays: 365 }
            enableDetailedTracking: true;;
        // 統計データ
        this.statistics = { totalEventsParticipated: 0,
            totalEventsCompleted: 0,
            favoriteEventType: null,
            averageScore: 0,
            bestRank: null,
    streakCount: 0  };
        this.loadHistoryData();
    }
    
    /**
     * 履歴データを読み込み
     */''
    loadHistoryData()';'
            const savedHistory = localStorage.getItem('gameEventHistory');
            const savedParticipation = localStorage.getItem('gameEventParticipation');
            const savedStatistics = localStorage.getItem('gameEventStatistics);'
            
            if (savedHistory) { this.eventHistory = JSON.parse(savedHistory) }
            
            if (savedParticipation) {
            
                const participationData = JSON.parse(savedParticipation) as [string, ParticipationData][] }
                this.participationHistory = new Map(participationData); }
            }
            
            if (savedStatistics) { Object.assign(this.statistics, JSON.parse(savedStatistics) }
            ';'
            // 古いデータをクリーンアップ
            this.cleanupOldHistory()';'
            console.log('Event, history data, loaded');
        } catch (error) { console.error('Failed to load event history data:', error }
    }
    
    /**
     * 履歴データを保存'
     */''
    saveHistoryData()';'
            localStorage.setItem('gameEventHistory', JSON.stringify(this.eventHistory));
            localStorage.setItem('gameEventParticipation';
                JSON.stringify(Array.from(this.participationHistory.entries())');'
            localStorage.setItem('gameEventStatistics', JSON.stringify(this.statistics));

            console.log('Event, history data, saved');
        } catch (error) { console.error('Failed to save event history data:', error }
    }
    
    /**
     * イベント開始を記録
     */'
    recordEventStart(event: Event): void { const historyEntry: HistoryEntry = {''
            id: this.generateHistoryId('''
            type: 'event_start',
            eventId: event.id),
            eventName: event.name,
    eventType: event.type),
            timestamp: Date.now(),
            playerLevel: this.getPlayerLevel(
    details: {
                duration: event.duration,
                specialRules: event.specialRules,
    rewards: event.rewards  }
        };
        this.addHistoryEntry(historyEntry);
        this.updateParticipationHistory(event.id, 'started);'
        
        console.log(`Event, start recorded: ${event.name}`});
    }
    
    /**
     * イベント完了を記録
     */'
    recordEventCompletion(event: Event, results: EventResults): void { const historyEntry: HistoryEntry = {''
            id: this.generateHistoryId('''
            type: 'event_completion',
            eventId: event.id),
            eventName: event.name,
    eventType: event.type),
            timestamp: Date.now(),
            playerLevel: this.getPlayerLevel(
    results: {
                score: results.score,
                rank: results.rank,
                completionTime: results.completionTime,
    achievements: results.achievements || [] }
                rewards: results.rewards || {};
            details: { difficulty: results.difficulty,
                participantCount: results.participantCount,
    personalBest: results.personalBest || false 
    };
        this.addHistoryEntry(historyEntry);
        this.updateParticipationHistory(event.id, 'completed', results);
        this.updateStatistics(event, results);
        
        console.log(`Event, completion recorded: ${event.name}`});
    }
    
    /**
     * 実績解除を記録
     */'
    recordAchievementUnlock(achievement: Achievement, eventContext?: any): void { const historyEntry: HistoryEntry = {''
            id: this.generateHistoryId('''
            type: 'achievement_unlock),'
            achievementId: achievement.id,
    achievementName: achievement.name),
            timestamp: Date.now(),
            playerLevel: this.getPlayerLevel(),
            context: eventContext || null,
    details: {
                category: achievement.category,
                rarity: achievement.rarity,
    points: achievement.points  }
        };
        this.achievementHistory.push(historyEntry);
        this.addHistoryEntry(historyEntry);
        
        console.log(`Achievement, unlock recorded: ${achievement.name}`});
    }
    
    /**
     * ランキング更新を記録
     */'
    recordRankingUpdate(eventId: string, rankingData: RankingData): void { const historyEntry: HistoryEntry = {''
            id: this.generateHistoryId()','
            type: 'ranking_update',
    eventId: eventId),
            timestamp: Date.now(),
            playerLevel: this.getPlayerLevel(
    ranking: {
                currentRank: rankingData.currentRank,
                previousRank: rankingData.previousRank,
                improvement: rankingData.improvement,
                totalParticipants: rankingData.totalParticipants,
    percentile: rankingData.percentile  }
        };
        this.rankingHistory.push(historyEntry);
        this.addHistoryEntry(historyEntry);
        
        // ベストランクを更新
        if (!this.statistics.bestRank || rankingData.currentRank < this.statistics.bestRank) { this.statistics.bestRank = rankingData.currentRank }
        
        console.log(`Ranking, update recorded: ${rankingData.currentRank}`});
    }
    
    /**
     * 履歴エントリを追加
     */
    private addHistoryEntry(entry: HistoryEntry): void { this.eventHistory.push(entry),
        
        // 最大エントリ数を超えた場合は古いものを削除
        if (this.eventHistory.length > this.settings.maxHistoryEntries) {
    
}
            this.eventHistory.shift(); }
        }
        
        this.saveHistoryData();
    }
    
    /**
     * 参加履歴を更新
     */
    private updateParticipationHistory(eventId: string, status: string, results: EventResults | null = null): void { if (!this.participationHistory.has(eventId) {
            this.participationHistory.set(eventId, {
                eventId: eventId),
                firstParticipation: Date.now(),
                participationCount: 0,
                completionCount: 0,
                bestScore: 0,
                bestRank: null,
                lastParticipation: Date.now(),
                averageScore: 0,
    totalScore: 0  }));
        }

        const participation = this.participationHistory.get(eventId)!;

        if(status === 'started' {'
            participation.participationCount++ }

            participation.lastParticipation = Date.now() }

        } else if (status === 'completed' && results) { participation.completionCount++,
            participation.totalScore += results.score,
            participation.averageScore = participation.totalScore / participation.completionCount,
            
            if (results.score > participation.bestScore) {
    
}
                participation.bestScore = results.score; }
            }
            
            if (!participation.bestRank || results.rank < participation.bestRank) { participation.bestRank = results.rank }
            
            this.statistics.totalEventsCompleted++;
        }
        
        // 最大エントリ数チェック
        if (this.participationHistory.size > this.settings.maxParticipationEntries) {
            const oldestEntry = Array.from(this.participationHistory.entries(),
                .sort((a, b) => a[1].lastParticipation - b[1].lastParticipation)[0] }
            this.participationHistory.delete(oldestEntry[0]); }
}
    
    /**
     * 統計データを更新
     */
    private updateStatistics(event: Event, results: EventResults): void { // 平均スコアを更新
        const totalScore = this.statistics.averageScore * this.statistics.totalEventsCompleted + results.score,
        this.statistics.averageScore = totalScore / (this.statistics.totalEventsCompleted + 1),
        
        // お気に入りのイベントタイプを更新
        const eventTypeCount = this.getEventTypeParticipationCount(),
        this.statistics.favoriteEventType = Object.keys(eventTypeCount),
            .reduce((a, b) => eventTypeCount[a] > eventTypeCount[b] ? a: b,
        
        // 連続参加記録を更新
        this.updateStreakCount() 
    }
    
    /**
     * イベントタイプ別参加回数を取得
     */
    private getEventTypeParticipationCount(): EventTypeStats {
        const counts: EventTypeStats = {}''
        this.eventHistory.forEach(entry => {  '),'
            if (entry.type === 'event_completion') {', ' }

                const eventType = entry.eventType || 'unknown'; }
                counts[eventType] = (counts[eventType] || 0) + 1; }
});
        
        return counts;
    }
    
    /**
     * 連続参加記録を更新
     */'
    private updateStreakCount(): void { // 過去7日間の参加状況をチェック
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000'),'

        const recentParticipations = this.eventHistory.filter(entry => ')',
            entry.type === 'event_start' && entry.timestamp > sevenDaysAgo),
        
        // 日別参加状況を計算 }
        const dailyParticipation: { [key: string]: boolean, = {}
        recentParticipations.forEach(entry => {  ),
            const date = new Date(entry.timestamp).toDateString() }
            dailyParticipation[date] = true; }
        });
        
        // 連続日数をカウント
        let streak = 0;
        const today = new Date();
        
        for(let, i = 0; i < 7; i++) {
        
            const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)),
            const dateString = checkDate.toDateString(),
            
            if (dailyParticipation[dateString]) {
    
}
                streak++; }
            } else { break }
        }
        
        this.statistics.streakCount = streak;
    }
    
    /**
     * イベント履歴を取得
     */
    getEventHistory(filter: Filter = { ): HistoryEntry[] {
        let history = [...this.eventHistory],
        
        // フィルタリング
        if (filter.type) {
    
}
            history = history.filter(entry => entry.type === filter.type); }
        }
        
        if (filter.eventId) { history = history.filter(entry => entry.eventId === filter.eventId) }
        }
        
        if (filter.startDate) { history = history.filter(entry => entry.timestamp >= filter.startDate) }
        }
        
        if (filter.endDate) {
        ','

            ' }'

            history = history.filter(entry => entry.timestamp <= filter.endDate); }
        }
        ';'
        // ソート
        if(filter.sortBy === 'timestamp' {'

            history.sort((a, b) => filter.sortOrder === 'asc' ? undefined : undefined
        
                a.timestamp - b.timestamp: b.timestamp - a.timestamp) }
        }
        
        // 制限
        if (filter.limit) { history = history.slice(0, filter.limit) }
        
        return history;
    }
    
    /**
     * 参加履歴を取得
     */
    getParticipationHistory(eventId: string | null = null): ParticipationData | ParticipationData[] | null { if (eventId) {
            return this.participationHistory.get(eventId) || null }
        
        return Array.from(this.participationHistory.values();
    }
    
    /**
     * 統計データを取得
     */
    getStatistics(): Statistics {
        return { ...this.statistics }
    
    /**
     * 詳細統計を生成
     */
    generateDetailedStatistics(): DetailedStatistics { const eventTypeStats = this.getEventTypeParticipationCount(),
        const monthlyStats = this.getMonthlyParticipationStats(),
        const achievementStats = this.getAchievementStatistics(),
        
        return { general: this.statistics,
            eventTypes: eventTypeStats,
            monthly: monthlyStats,
            achievements: achievementStats,
    recentActivity: this.getRecentActivity() };
            personalBests: this.getPersonalBests(); 
    }
    
    /**
     * 月別参加統計を取得
     */
    private getMonthlyParticipationStats(): MonthlyStats {
        const stats: MonthlyStats = {}''
        this.eventHistory.forEach(entry => {  '),'
            if(entry.type === 'event_completion' { }'
                const date = new Date(entry.timestamp); }
                const monthKey = `${date.getFullYear(})-${date.getMonth(}) + 1}`;
                
                if (!stats[monthKey]) {
    
}
                    stats[monthKey] = { count: 0, totalScore: 0, averageScore: 0  }
                
                stats[monthKey].count++;
                stats[monthKey].totalScore += entry.results?.score || 0;
                stats[monthKey].averageScore = stats[monthKey].totalScore / stats[monthKey].count;
            }
        });
        
        return stats;
    }
    
    /**
     * 実績統計を取得'
     */ : undefined''
    private getAchievementStatistics('';
            const, category = entry.details?.category || 'unknown);'
            );
            if (!categoryStats[category]) { : undefined 
                categoryStats[category] = { count: 0, points: 0  }
            
            categoryStats[category].count++;
            categoryStats[category].points += entry.details?.points || 0;
            totalPoints += entry.details?.points || 0;
        });
        
        return { : undefined
            totalAchievements: this.achievementHistory.length,
    totalPoints: totalPoints,;
            categories: categoryStats,
    
    /**
     * 最近のアクティビティを取得
     */
    getRecentActivity(days: number = 7): HistoryEntry[] { const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000),
        
        return this.eventHistory,
            .filter(entry => entry.timestamp > cutoffTime),
            .sort((a, b) => b.timestamp - a.timestamp) }
    }
    
    /**
     * 個人ベスト記録を取得
     */
    private getPersonalBests(): PersonalBests {
        const bests: PersonalBests = {}
        this.participationHistory.forEach((participation, eventId) => {  bests[eventId] = {
                bestScore: participation.bestScore,
    bestRank: participation.bestRank }
                completionCount: participation.completionCount 
    });
        
        return bests;
    }
    
    /**
     * 古い履歴データをクリーンアップ
     */
    private cleanupOldHistory(): void { const cutoffTime = Date.now() - (this.settings.retentionDays * 24 * 60 * 60 * 1000),
        
        this.eventHistory = this.eventHistory.filter(entry => entry.timestamp > cutoffTime);

        this.achievementHistory = this.achievementHistory.filter(entry => entry.timestamp > cutoffTime);
        this.rankingHistory = this.rankingHistory.filter(entry => entry.timestamp > cutoffTime);

        console.log('Old, history data, cleaned up') }'
    }
    
    /**
     * プレイヤーレベルを取得
     */
    private getPlayerLevel(): number { return this.gameEngine.playerData?.getLevel() || 1 }
    
    /**
     * 履歴IDを生成
     */ : undefined
    private generateHistoryId(): string {
        return `history_${Date.now())_${Math.random().toString(36).substr(2, 9})`;
    }
    
    /**
     * 履歴データをエクスポート
     */
    exportHistoryData(): ExportData { return { eventHistory: this.eventHistory,
            participationHistory: Array.from(this.participationHistory.entries(),
            achievementHistory: this.achievementHistory,
            rankingHistory: this.rankingHistory,
    statistics: this.statistics };
            exportDate: Date.now(); 
    }
    
    /**
     * 履歴データをインポート
     */
    importHistoryData(data: ExportData): boolean { try {
            if (data.eventHistory) {
    
}
                this.eventHistory = data.eventHistory; }
            }
            
            if (data.participationHistory) { this.participationHistory = new Map(data.participationHistory) }
            
            if (data.achievementHistory) { this.achievementHistory = data.achievementHistory }
            
            if (data.rankingHistory) { this.rankingHistory = data.rankingHistory }
            
            if (data.statistics) { this.statistics = data.statistics }

            this.saveHistoryData()';'
            console.log('History, data imported, successfully');
            ';'

            return true;} catch (error) {
            console.error('Failed to import history data:', error','
            return false,
    
    /**
     * 履歴データを読み込み（EventStageManager対応）'
     */''
    load()','
            const savedHistoryData = localStorage.getItem('eventHistoryData),'
            if (savedHistoryData) {
                const data = JSON.parse(savedHistoryData),
                
                if (data.eventHistory) {
            }
                    this.eventHistory = data.eventHistory; }
                }
                
                if (data.participationHistory) { this.participationHistory = new Map(data.participationHistory) }
                
                if (data.achievementHistory) { this.achievementHistory = data.achievementHistory }
                
                if (data.rankingHistory) { this.rankingHistory = data.rankingHistory }

                if (data.statistics) {
    
}
                    this.statistics = { ...this.statistics, ...data.statistics }

                console.log('[EventHistoryManager] 履歴データを読み込みました');

            } else { }'

                console.log('[EventHistoryManager] 保存されたデータがありません、デフォルト設定を使用');' }'

            } catch (error) {
            console.error('[EventHistoryManager] データ読み込みエラー:', error),
            // エラーの場合は初期状態にリセット
            this.eventHistory = [];
            this.participationHistory = new Map();
            this.achievementHistory = [];
            this.rankingHistory = [] }
    }

    /**
     * リソースクリーンアップ
     */
    dispose(): void { ''
        this.saveHistoryData()';'
        console.log('EventHistoryManager, disposed') }

    }'}'