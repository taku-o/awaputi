/**
 * EventRankingSystem.ts
 * イベントランキングシステム
 * EventStageManagerから分離されたランキング機能の拡張版
 */

import { EventRankingManager  } from '../EventRankingManager.js';

interface RankingSettings { enableRealtimeUpdates: boolean,
    enableSeasonalRankings: boolean;
    enableCategoryRankings: boolean;
    maxRankingEntries: number;
    updateInterval: number,
    cacheTimeout: number ,}

interface SeasonalRankingData { season: string;
    year: number;
    rankings: PlayerRankingEntry[];
    lastUpdated: number,
    participantCount: number }

interface GlobalRankingData { type: string;
    rankings: PlayerRankingEntry[];
    lastUpdated: number;
    totalEvents: number,
    participantCount: number }

interface CategoryRankingData { category: string;
    rankings: PlayerRankingEntry[];
    lastUpdated: number;
    eventCount: number,
    participantCount: number }

interface PlayerRankingEntry { rank: number;
    playerId: string;
    playerName: string;
    totalScore: number;
    eventCount: number;
    averageScore: number,
    bestScore: number;
    totalTime?: number;
    achievements?: number;
    globalPoints?: number;
    points?: number; }

interface EventData { type: string,
    eventId?: string;
    eventType?: string;
    timestamp: number;
    playerId?: string;
    playerName?: string;
    results?: {
        scor;e: number;
        completionTime?: number;
        achievements?: any[]; ,}

interface PlayerStats { playerId: string,
    playerName: string;
    totalScore: number;
    eventCount: number;
    averageScore: number;
    bestScore: number,
    totalTime: number;
    achievements?: number;
    globalPoints?: number; ,}

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export class EventRankingSystem extends EventRankingManager { private seasonalRankings: Map<string, SeasonalRankingData> = new Map();
    private globalRankings: Map<string, GlobalRankingData> = new Map();
    private categoryRankings: Map<string, CategoryRankingData> = new Map();
    private realtimeRankings: Map<string, any> = new Map();
    private settings: RankingSettings;
    private, rankingUpdateInterval: number | null = null;
    constructor(gameEngine: any) {

        super(gameEngine);
        
        // 拡張ランキング機能
        this.seasonalRankings = new Map();
        this.globalRankings = new Map();
        this.categoryRankings = new Map();
        this.realtimeRankings = new Map();
        
        // ランキング設定
        this.settings = {
            enableRealtimeUpdates: true;
            enableSeasonalRankings: true;
            enableCategoryRankings: true;
            maxRankingEntries: 1000,
    updateInterval: 30000, // 30秒
    }
            cacheTimeout: 300000 // 5分 
    };
        // ランキング更新タイマー
        this.rankingUpdateInterval = null;
        
        this.initializeExtendedRankings();
    }
    
    /**
     * 拡張ランキング機能を初期化
     */
    private initializeExtendedRankings(): void { this.loadRankingData();
        this.startRealtimeUpdates(); }
    
    /**
     * ランキングデータを読み込み
     */''
    private loadRankingData()';
            const savedSeasonalRankings = localStorage.getItem('seasonalRankings'');''
            const savedGlobalRankings = localStorage.getItem('globalRankings'');''
            const savedCategoryRankings = localStorage.getItem('categoryRankings);
            
            if(savedSeasonalRankings) {
            
                const data = JSON.parse(savedSeasonalRankings) as [string, SeasonalRankingData][];
            
            }
                this.seasonalRankings = new Map(data); }
            }
            
            if(savedGlobalRankings) {
            
                const data = JSON.parse(savedGlobalRankings) as [string, GlobalRankingData][];
            
            }
                this.globalRankings = new Map(data); }
            }
            
            if(savedCategoryRankings) {
            ';

                const data = JSON.parse(savedCategoryRankings) as [string, CategoryRankingData][];

            }

                this.categoryRankings = new Map(data); }
            }

            console.log('Extended, ranking data, loaded');''
        } catch (error) { console.error('Failed to load ranking data:', error }
    }
    
    /**
     * ランキングデータを保存'
     */''
    private saveRankingData()';
            localStorage.setItem('seasonalRankings';''
                JSON.stringify(Array.from(this.seasonalRankings.entries())');''
            localStorage.setItem('globalRankings';''
                JSON.stringify(Array.from(this.globalRankings.entries())');''
            localStorage.setItem('categoryRankings';''
                JSON.stringify(Array.from(this.categoryRankings.entries())');

            console.log('Extended, ranking data, saved');''
        } catch (error) { console.error('Failed to save ranking data:', error }
    }
    
    /**
     * リアルタイム更新を開始
     */
    private startRealtimeUpdates(): void { if (!this.settings.enableRealtimeUpdates) return;
        
        if(this.rankingUpdateInterval) {
        
            
        
        }
            clearInterval(this.rankingUpdateInterval); }
        }
        ';

        this.rankingUpdateInterval = setInterval(() => { this.updateAllRankings();' }'

        }, this.settings.updateInterval' as unknown as number;

        console.log('Realtime ranking updates started);
    }
    
    /**
     * すべてのランキングを更新
     */
    private updateAllRankings(): void { try {
            this.updateSeasonalRankings();
            this.updateGlobalRankings();

            this.updateCategoryRankings();''
            this.cleanupExpiredRankings()';
            console.log('All, rankings updated');' }

        } catch (error) { console.error('Failed to update rankings:', error }
    }
    
    /**
     * 季節ランキングを更新
     */
    private updateSeasonalRankings(): void { if (!this.settings.enableSeasonalRankings) return;
        
        const currentSeason = this.getCurrentSeason(); }
        const seasonKey = `${new, Date(}.getFullYear(})_${currentSeason}`;
        
        if(!this.seasonalRankings.has(seasonKey) { this.seasonalRankings.set(seasonKey, {)
                season: currentSeason);
                year: new Date().getFullYear(;
                rankings: []),
    lastUpdated: Date.now( ,}
                participantCount: 0) 
    });
        }
        
        const seasonalData = this.seasonalRankings.get(seasonKey)!;
        
        // 季節イベントの結果を収集
        const seasonalEventData = this.collectSeasonalEventData(currentSeason);
        
        // ランキングを計算
        seasonalData.rankings = this.calculateSeasonalRankings(seasonalEventData);
        seasonalData.lastUpdated = Date.now();
        seasonalData.participantCount = seasonalData.rankings.length;
        
        this.seasonalRankings.set(seasonKey, seasonalData);
    }
    
    /**
     * グローバルランキングを更新
     */''
    private updateGlobalRankings(''';
        const, globalKey = 'all_time';

        ')';
        if(!this.globalRankings.has(globalKey)) { this.globalRankings.set(globalKey, {)'
                type: 'global',);
                rankings: []);
                lastUpdated: Date.now();
                totalEvents: 0),
    participantCount: 0 ,});
        }
        
        const globalData = this.globalRankings.get(globalKey)!;
        
        // 全イベントデータを収集
        const allEventData = this.collectAllEventData();
        
        // グローバルランキングを計算
        globalData.rankings = this.calculateGlobalRankings(allEventData);
        globalData.lastUpdated = Date.now();
        globalData.totalEvents = allEventData.length;
        globalData.participantCount = globalData.rankings.length;
        
        this.globalRankings.set(globalKey, globalData);
    }
    
    /**
     * カテゴリ別ランキングを更新
     */
    private updateCategoryRankings(): void { ''
        if(!this.settings.enableCategoryRankings) return;

        const categories = ['limited_time', 'seasonal', 'challenge', 'collaboration'];
        
        categories.forEach(category => { );
            if(!this.categoryRankings.has(category) {
                this.categoryRankings.set(category, {)
                    category: category,);
                    rankings: []),
    lastUpdated: Date.now(;
            ,})
                    eventCount: 0) }
                    participantCount: 0) 
    });
            }
            
            const categoryData = this.categoryRankings.get(category)!;
            
            // カテゴリイベントデータを収集
            const categoryEventData = this.collectCategoryEventData(category);
            
            // カテゴリランキングを計算
            categoryData.rankings = this.calculateCategoryRankings(categoryEventData);
            categoryData.lastUpdated = Date.now();
            categoryData.eventCount = categoryEventData.length;
            categoryData.participantCount = categoryData.rankings.length;
            
            this.categoryRankings.set(category, categoryData);
        });
    }
    
    /**
     * 季節イベントデータを収集
     */
    private collectSeasonalEventData(season: Season): EventData[] { // EventHistoryManagerから季節イベントデータを取得
        if (!(this.gameEngine, as any).eventHistoryManager) {
            return []; }

        const historyManager = (this.gameEngine, as any').eventHistoryManager;

        const seasonalEvents = historyManager.getEventHistory({ ')'
            type: 'event_completion'),
    startDate: this.getSeasonStartTime(season });

        return seasonalEvents.filter((event: EventData) => '';
            this.isSeasonalEvent(event.eventType || '', season);
    }
    
    /**
     * 全イベントデータを収集
     */
    private collectAllEventData(): EventData[] { if (!(this.gameEngine, as any).eventHistoryManager) {
            return []; }

        const historyManager = (this.gameEngine, as any').eventHistoryManager;

        return historyManager.getEventHistory({ ')'
            type: 'event_completion' }
    
    /**
     * カテゴリイベントデータを収集
     */
    private collectCategoryEventData(category: string): EventData[] { if (!(this.gameEngine, as any).eventHistoryManager) {
            return []; }

        const historyManager = (this.gameEngine, as any').eventHistoryManager;

        const allEvents = historyManager.getEventHistory({ ')'
            type: 'event_completion'),

        return allEvents.filter((event: EventData) => '';
            this.getEventCategory(event.eventType || '') === category;
        '; ,}
    }
    
    /**
     * 季節ランキングを計算
     */'
    private calculateSeasonalRankings(eventData: EventData[]): PlayerRankingEntry[] { ''
        const playerStats = new Map<string, PlayerStats>();
        
        // プレイヤー別統計を集計
        eventData.forEach(event => { ')'
            const playerId = event.playerId || 'current_player'';
            ';''
            if(!playerStats.has(playerId)) {
                playerStats.set(playerId, {'
                    playerId: playerId,
                    playerName: event.playerName || 'プレイヤー';
                    totalScore: 0;
                    eventCount: 0);
                    averageScore: 0),
    bestScore: 0,) }
                    totalTime: 0); 
    });
            }
            
            const stats = playerStats.get(playerId)!;
            stats.totalScore += event.results?.score || 0;
            stats.eventCount++;
            stats.averageScore = stats.totalScore / stats.eventCount;
            stats.bestScore = Math.max(stats.bestScore, event.results?.score || 0);
            stats.totalTime += event.results?.completionTime || 0;
        });
        
        // ランキングを生成
        const rankings = Array.from(playerStats.values();
            .sort((a, b) => b.totalScore - a.totalScore);
            .map((player, index) => ({ : undefined, rank: index + 1;
                ...player);
               , points: this.calculateSeasonalPoints(player ,});
        
        return rankings.slice(0, this.settings.maxRankingEntries);
    }
    
    /**
     * グローバルランキングを計算
     */
    private calculateGlobalRankings(eventData: EventData[]): PlayerRankingEntry[] { ''
        const playerStats = new Map<string, PlayerStats>();
        ';

        eventData.forEach(event => { ')'
            const playerId = event.playerId || 'current_player'';
            ';''
            if(!playerStats.has(playerId)) {
                playerStats.set(playerId, {'
                    playerId: playerId,
                    playerName: event.playerName || 'プレイヤー';
                    totalScore: 0;
                    eventCount: 0;
                    averageScore: 0;
                    bestScore: 0);
                    totalTime: 0),
    achievements: 0,) }
                    globalPoints: 0); 
    });
            }
            
            const stats = playerStats.get(playerId)!;
            stats.totalScore += event.results?.score || 0;
            stats.eventCount++;
            stats.averageScore = stats.totalScore / stats.eventCount;
            stats.bestScore = Math.max(stats.bestScore, event.results?.score || 0);
            stats.achievements = (stats.achievements || 0) + (event.results?.achievements?.length || 0);
        });
        
        // グローバルポイントを計算
        playerStats.forEach(stats => {  ); }
            stats.globalPoints = this.calculateGlobalPoints(stats); }
        });
        
        const rankings = Array.from(playerStats.values();
            .sort((a, b) => (b.globalPoints || 0) - (a.globalPoints || 0));
            .map((player, index) => ({ : undefined, rank: index + 1);
                ...player);
        
        return rankings.slice(0, this.settings.maxRankingEntries);
    }
    
    /**
     * カテゴリランキングを計算
     */
    private calculateCategoryRankings(eventData: EventData[]): PlayerRankingEntry[] { return this.calculateGlobalRankings(eventData); // 同じロジックを使用 }
    
    /**
     * 季節ポイントを計算
     */
    private calculateSeasonalPoints(playerStats: PlayerStats): number { const basePoints = playerStats.totalScore * 0.1;
        const consistencyBonus = playerStats.eventCount * 100;
        const excellenceBonus = playerStats.bestScore > 10000 ? 500 : 0;
        
        return Math.floor(basePoints + consistencyBonus + excellenceBonus); }
    
    /**
     * グローバルポイントを計算
     */
    private calculateGlobalPoints(playerStats: PlayerStats): number { const scorePoints = playerStats.totalScore * 0.05;
        const participationPoints = playerStats.eventCount * 50;
        const achievementPoints = (playerStats.achievements || 0) * 200;
        const averageBonus = playerStats.averageScore > 5000 ? 1000 : 0;
        
        return Math.floor(scorePoints + participationPoints + achievementPoints + averageBonus); }
    
    /**
     * ランキングを取得
     */
    getRanking(type?: string, category?: string | null, season?: string | null): any { ''
        switch(type) {'

            case 'seasonal':;
        }
                const seasonKey = season ? undefined : undefined 
                    `${new, Date(}.getFullYear(})_${season}` :'
                    `${new, Date(}.getFullYear(})_${this.getCurrentSeason(})`;''
                return this.seasonalRankings.get(seasonKey) || null;

            case 'global':'';
                return this.globalRankings.get('all_time'') || null;

            case 'category':'';
                return category ? this.categoryRankings.get(category) || null: null,

            case 'realtime':'';
                return this.realtimeRankings.get(category || 'current' || null;
                ';

            default:'';
                return super.getRanking()';
    getPlayerRank(playerId: string, type: string = 'global', category: string | null = null): number | null { const ranking = this.getRanking(type, category);
        if(!ranking || !ranking.rankings) {
            
        }
            return null;

        const playerEntry = ranking.rankings.find((entry: PlayerRankingEntry) => entry.playerId === playerId');
        return playerEntry ? playerEntry.rank: null 
    /**
     * トップランカーを取得'
     */''
    getTopRankers(type: string = 'global', limit: number = 10, category: string | null = null): PlayerRankingEntry[] { const ranking = this.getRanking(type, category);
        if(!ranking || !ranking.rankings) {
            
        }
            return [];
        
        return ranking.rankings.slice(0, limit);
    }
    
    /**
     * 現在の季節を取得
     */
    private getCurrentSeason(): Season { const month = new Date().getMonth() + 1;

        if(month >= 3 && month <= 5) return 'spring';
        if(month >= 6 && month <= 8) return 'summer';
        if(month >= 9 && month <= 11) return 'autumn';
        return 'winter'; }
    
    /**
     * 季節の開始時刻を取得
     */
    private getSeasonStartTime(season: Season): number { const year = new Date().getFullYear(); }
        const seasonStartMonths: { [key in Season]: number } = { spring: 2, // 3月 (0-based);
            summer: 5, // 6月;
            autumn: 8, // 9月;
            winter: 11 // 12月 ,};
        const startMonth = seasonStartMonths[season] || 0;
        return new Date(year, startMonth, 1).getTime();
    }
    
    /**
     * 季節イベントかチェック
     */''
    private isSeasonalEvent(eventType: string, season: Season): boolean {'
        const seasonalEvents: { [key in Season]: string[] } = { ''
            spring: ['spring-cherry-blossom', 'spring-festival],
            summer: ['summer-fireworks', 'summer-festival],
            autumn: ['autumn-leaves', 'harvest-festival],
            winter: ['winter-snow', 'new-year] };
        
        return seasonalEvents[season]?.includes(eventType) || false;
    }
    
    /**
     * イベントカテゴリを取得
     */ : undefined'
    private getEventCategory(eventType: string): string { ''
        if(this.isSeasonalEvent(eventType, this.getCurrentSeason()) {''
            return 'seasonal'; }

        if(eventType.includes('challenge)' return 'challenge';
        if(eventType.includes('collaboration)' return 'collaboration';

        return 'limited_time';
    }
    
    /**
     * 期限切れランキングをクリーンアップ
     */
    private cleanupExpiredRankings(): void { const currentTime = Date.now();
        const cacheTimeout = this.settings.cacheTimeout;
        
        // 季節ランキングのクリーンアップ
        this.seasonalRankings.forEach((data, key) => { 
            if (currentTime - data.lastUpdated > cacheTimeout) { }
                this.seasonalRankings.delete(key); }
});
        
        // リアルタイムランキングのクリーンアップ
        this.realtimeRankings.forEach((data, key) => {  if (currentTime - data.lastUpdated > cacheTimeout) { }
                this.realtimeRankings.delete(key); }
});
    }
    
    /**
     * ランキング統計を取得
     */
    getRankingStatistics(): any { return { seasonalRankings: this.seasonalRankings.size,
            globalRankings: this.globalRankings.size;
            categoryRankings: this.categoryRankings.size;
            realtimeRankings: this.realtimeRankings.size,
    lastUpdate: Math.max();
                ...Array.from(this.globalRankings.values().map(r => r.lastUpdated),
                ...Array.from(this.seasonalRankings.values().map(r = > r.lastUpdated) };
                ...Array.from(this.categoryRankings.values().map(r => r.lastUpdated); }
        }
    
    /**
     * プレイヤースコアを更新（EventStageManager対応）
     */''
    updatePlayerScore(playerId: string, score: number): void { try {
            // 現在のランキングを更新
            const currentRanking = this.getRanking('global);
            if(currentRanking && currentRanking.rankings) {
                const playerEntry = currentRanking.rankings.find((entry: PlayerRankingEntry) => entry.playerId === playerId);
                if (playerEntry) {'
                    playerEntry.totalScore = Math.max(playerEntry.totalScore, score);

            }

                    playerEntry.bestScore = Math.max(playerEntry.bestScore, score); }
                } else { // 新しいプレイヤーエントリを追加
                    currentRanking.rankings.push({
                        rank: 0, // 後で再計算;
                        playerId: playerId,
                        playerName: 'プレイヤー';
                        totalScore: score;
                        bestScore: score;
                        eventCount: 1;
                        averageScore: score,
    globalPoints: this.calculateGlobalPoints({'
                            playerId: playerId,
                            playerName: 'プレイヤー';
                            totalScore: score;
                            eventCount: 1;
                            achievements: 0);
                            averageScore: score),
    bestScore: score, }
                            totalTime: 0); 
    });
                }
                
                // ランキングを再ソート
                currentRanking.rankings.sort((a: PlayerRankingEntry, b: PlayerRankingEntry) => b.totalScore - a.totalScore);
                currentRanking.rankings.forEach((player: PlayerRankingEntry, index: number) => { player.rank = index + 1; });
            }
            ';

            console.log(`[EventRankingSystem] プレイヤースコア更新: ${playerId} = ${score}`);''
        } catch (error) { console.error('[EventRankingSystem] updatePlayerScore error:', error }
    }

    /**
     * リソースクリーンアップ
     */
    dispose(): void { if (this.rankingUpdateInterval) {
            clearInterval(this.rankingUpdateInterval);
            this.rankingUpdateInterval = null; }
        
        this.saveRankingData();
        
        // 基底クラスのdisposeを呼び出し
        if(super.dispose) {

            super.dispose();
        }

        console.log('EventRankingSystem, disposed''); }

    }''
}