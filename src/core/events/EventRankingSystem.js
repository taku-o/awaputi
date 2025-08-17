/**
 * EventRankingSystem.js
 * イベントランキングシステム
 * EventStageManagerから分離されたランキング機能の拡張版
 */

import { EventRankingManager } from '../EventRankingManager.js';

export class EventRankingSystem extends EventRankingManager {
    constructor(gameEngine) {
        super(gameEngine);
        
        // 拡張ランキング機能
        this.seasonalRankings = new Map();
        this.globalRankings = new Map();
        this.categoryRankings = new Map();
        this.realtimeRankings = new Map();
        
        // ランキング設定
        this.settings = {
            enableRealtimeUpdates: true,
            enableSeasonalRankings: true,
            enableCategoryRankings: true,
            maxRankingEntries: 1000,
            updateInterval: 30000, // 30秒
            cacheTimeout: 300000 // 5分
        };
        
        // ランキング更新タイマー
        this.rankingUpdateInterval = null;
        
        this.initializeExtendedRankings();
    }
    
    /**
     * 拡張ランキング機能を初期化
     */
    initializeExtendedRankings() {
        this.loadRankingData();
        this.startRealtimeUpdates();
    }
    
    /**
     * ランキングデータを読み込み
     */
    loadRankingData() {
        try {
            const savedSeasonalRankings = localStorage.getItem('seasonalRankings');
            const savedGlobalRankings = localStorage.getItem('globalRankings');
            const savedCategoryRankings = localStorage.getItem('categoryRankings');
            
            if (savedSeasonalRankings) {
                const data = JSON.parse(savedSeasonalRankings);
                this.seasonalRankings = new Map(data);
            }
            
            if (savedGlobalRankings) {
                const data = JSON.parse(savedGlobalRankings);
                this.globalRankings = new Map(data);
            }
            
            if (savedCategoryRankings) {
                const data = JSON.parse(savedCategoryRankings);
                this.categoryRankings = new Map(data);
            }
            
            console.log('Extended ranking data loaded');
        } catch (error) {
            console.error('Failed to load ranking data:', error);
        }
    }
    
    /**
     * ランキングデータを保存
     */
    saveRankingData() {
        try {
            localStorage.setItem('seasonalRankings', 
                JSON.stringify(Array.from(this.seasonalRankings.entries())));
            localStorage.setItem('globalRankings',
                JSON.stringify(Array.from(this.globalRankings.entries())));
            localStorage.setItem('categoryRankings',
                JSON.stringify(Array.from(this.categoryRankings.entries())));
            
            console.log('Extended ranking data saved');
        } catch (error) {
            console.error('Failed to save ranking data:', error);
        }
    }
    
    /**
     * リアルタイム更新を開始
     */
    startRealtimeUpdates() {
        if (!this.settings.enableRealtimeUpdates) return;
        
        if (this.rankingUpdateInterval) {
            clearInterval(this.rankingUpdateInterval);
        }
        
        this.rankingUpdateInterval = setInterval(() => {
            this.updateAllRankings();
        }, this.settings.updateInterval);
        
        console.log('Realtime ranking updates started');
    }
    
    /**
     * すべてのランキングを更新
     */
    updateAllRankings() {
        try {
            this.updateSeasonalRankings();
            this.updateGlobalRankings();
            this.updateCategoryRankings();
            this.cleanupExpiredRankings();
            
            console.log('All rankings updated');
        } catch (error) {
            console.error('Failed to update rankings:', error);
        }
    }
    
    /**
     * 季節ランキングを更新
     */
    updateSeasonalRankings() {
        if (!this.settings.enableSeasonalRankings) return;
        
        const currentSeason = this.getCurrentSeason();
        const seasonKey = `${new Date().getFullYear()}_${currentSeason}`;
        
        if (!this.seasonalRankings.has(seasonKey)) {
            this.seasonalRankings.set(seasonKey, {
                season: currentSeason,
                year: new Date().getFullYear(),
                rankings: [],
                lastUpdated: Date.now(),
                participantCount: 0
            });
        }
        
        const seasonalData = this.seasonalRankings.get(seasonKey);
        
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
     */
    updateGlobalRankings() {
        const globalKey = 'all_time';
        
        if (!this.globalRankings.has(globalKey)) {
            this.globalRankings.set(globalKey, {
                type: 'global',
                rankings: [],
                lastUpdated: Date.now(),
                totalEvents: 0,
                participantCount: 0
            });
        }
        
        const globalData = this.globalRankings.get(globalKey);
        
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
    updateCategoryRankings() {
        if (!this.settings.enableCategoryRankings) return;
        
        const categories = ['limited_time', 'seasonal', 'challenge', 'collaboration'];
        
        categories.forEach(category => {
            if (!this.categoryRankings.has(category)) {
                this.categoryRankings.set(category, {
                    category: category,
                    rankings: [],
                    lastUpdated: Date.now(),
                    eventCount: 0,
                    participantCount: 0
                });
            }
            
            const categoryData = this.categoryRankings.get(category);
            
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
    collectSeasonalEventData(season) {
        // EventHistoryManagerから季節イベントデータを取得
        if (!this.gameEngine.eventHistoryManager) {
            return [];
        }
        
        const historyManager = this.gameEngine.eventHistoryManager;
        const seasonalEvents = historyManager.getEventHistory({
            type: 'event_completion',
            startDate: this.getSeasonStartTime(season)
        });
        
        return seasonalEvents.filter(event => 
            this.isSeasonalEvent(event.eventType, season)
        );
    }
    
    /**
     * 全イベントデータを収集
     */
    collectAllEventData() {
        if (!this.gameEngine.eventHistoryManager) {
            return [];
        }
        
        const historyManager = this.gameEngine.eventHistoryManager;
        return historyManager.getEventHistory({
            type: 'event_completion'
        });
    }
    
    /**
     * カテゴリイベントデータを収集
     */
    collectCategoryEventData(category) {
        if (!this.gameEngine.eventHistoryManager) {
            return [];
        }
        
        const historyManager = this.gameEngine.eventHistoryManager;
        const allEvents = historyManager.getEventHistory({
            type: 'event_completion'
        });
        
        return allEvents.filter(event => 
            this.getEventCategory(event.eventType) === category
        );
    }
    
    /**
     * 季節ランキングを計算
     */
    calculateSeasonalRankings(eventData) {
        const playerStats = new Map();
        
        // プレイヤー別統計を集計
        eventData.forEach(event => {
            const playerId = event.playerId || 'current_player';
            
            if (!playerStats.has(playerId)) {
                playerStats.set(playerId, {
                    playerId: playerId,
                    playerName: event.playerName || 'プレイヤー',
                    totalScore: 0,
                    eventCount: 0,
                    averageScore: 0,
                    bestScore: 0,
                    totalTime: 0
                });
            }
            
            const stats = playerStats.get(playerId);
            stats.totalScore += event.results?.score || 0;
            stats.eventCount++;
            stats.averageScore = stats.totalScore / stats.eventCount;
            stats.bestScore = Math.max(stats.bestScore, event.results?.score || 0);
            stats.totalTime += event.results?.completionTime || 0;
        });
        
        // ランキングを生成
        const rankings = Array.from(playerStats.values())
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((player, index) => ({
                rank: index + 1,
                ...player,
                points: this.calculateSeasonalPoints(player)
            }));
        
        return rankings.slice(0, this.settings.maxRankingEntries);
    }
    
    /**
     * グローバルランキングを計算
     */
    calculateGlobalRankings(eventData) {
        const playerStats = new Map();
        
        eventData.forEach(event => {
            const playerId = event.playerId || 'current_player';
            
            if (!playerStats.has(playerId)) {
                playerStats.set(playerId, {
                    playerId: playerId,
                    playerName: event.playerName || 'プレイヤー',
                    totalScore: 0,
                    eventCount: 0,
                    averageScore: 0,
                    bestScore: 0,
                    achievements: 0,
                    globalPoints: 0
                });
            }
            
            const stats = playerStats.get(playerId);
            stats.totalScore += event.results?.score || 0;
            stats.eventCount++;
            stats.averageScore = stats.totalScore / stats.eventCount;
            stats.bestScore = Math.max(stats.bestScore, event.results?.score || 0);
            stats.achievements += (event.results?.achievements?.length || 0);
        });
        
        // グローバルポイントを計算
        playerStats.forEach(stats => {
            stats.globalPoints = this.calculateGlobalPoints(stats);
        });
        
        const rankings = Array.from(playerStats.values())
            .sort((a, b) => b.globalPoints - a.globalPoints)
            .map((player, index) => ({
                rank: index + 1,
                ...player
            }));
        
        return rankings.slice(0, this.settings.maxRankingEntries);
    }
    
    /**
     * カテゴリランキングを計算
     */
    calculateCategoryRankings(eventData) {
        return this.calculateGlobalRankings(eventData); // 同じロジックを使用
    }
    
    /**
     * 季節ポイントを計算
     */
    calculateSeasonalPoints(playerStats) {
        const basePoints = playerStats.totalScore * 0.1;
        const consistencyBonus = playerStats.eventCount * 100;
        const excellenceBonus = playerStats.bestScore > 10000 ? 500 : 0;
        
        return Math.floor(basePoints + consistencyBonus + excellenceBonus);
    }
    
    /**
     * グローバルポイントを計算
     */
    calculateGlobalPoints(playerStats) {
        const scorePoints = playerStats.totalScore * 0.05;
        const participationPoints = playerStats.eventCount * 50;
        const achievementPoints = playerStats.achievements * 200;
        const averageBonus = playerStats.averageScore > 5000 ? 1000 : 0;
        
        return Math.floor(scorePoints + participationPoints + achievementPoints + averageBonus);
    }
    
    /**
     * ランキングを取得
     */
    getRanking(type, category = null, season = null) {
        switch (type) {
            case 'seasonal':
                const seasonKey = season ? 
                    `${new Date().getFullYear()}_${season}` :
                    `${new Date().getFullYear()}_${this.getCurrentSeason()}`;
                return this.seasonalRankings.get(seasonKey) || null;
                
            case 'global':
                return this.globalRankings.get('all_time') || null;
                
            case 'category':
                return category ? this.categoryRankings.get(category) || null : null;
                
            case 'realtime':
                return this.realtimeRankings.get(category || 'current') || null;
                
            default:
                return super.getRanking(); // 基底クラスのメソッドを呼び出し
        }
    }
    
    /**
     * プレイヤーランクを取得
     */
    getPlayerRank(playerId, type = 'global', category = null) {
        const ranking = this.getRanking(type, category);
        if (!ranking || !ranking.rankings) {
            return null;
        }
        
        const playerEntry = ranking.rankings.find(entry => entry.playerId === playerId);
        return playerEntry ? playerEntry.rank : null;
    }
    
    /**
     * トップランカーを取得
     */
    getTopRankers(type = 'global', limit = 10, category = null) {
        const ranking = this.getRanking(type, category);
        if (!ranking || !ranking.rankings) {
            return [];
        }
        
        return ranking.rankings.slice(0, limit);
    }
    
    /**
     * 現在の季節を取得
     */
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }
    
    /**
     * 季節の開始時刻を取得
     */
    getSeasonStartTime(season) {
        const year = new Date().getFullYear();
        const seasonStartMonths = {
            spring: 2, // 3月 (0-based)
            summer: 5, // 6月
            autumn: 8, // 9月
            winter: 11 // 12月
        };
        
        const startMonth = seasonStartMonths[season] || 0;
        return new Date(year, startMonth, 1).getTime();
    }
    
    /**
     * 季節イベントかチェック
     */
    isSeasonalEvent(eventType, season) {
        const seasonalEvents = {
            spring: ['spring-cherry-blossom', 'spring-festival'],
            summer: ['summer-fireworks', 'summer-festival'],
            autumn: ['autumn-leaves', 'harvest-festival'],
            winter: ['winter-snow', 'new-year']
        };
        
        return seasonalEvents[season]?.includes(eventType) || false;
    }
    
    /**
     * イベントカテゴリを取得
     */
    getEventCategory(eventType) {
        if (this.isSeasonalEvent(eventType, this.getCurrentSeason())) {
            return 'seasonal';
        }
        
        if (eventType.includes('challenge')) return 'challenge';
        if (eventType.includes('collaboration')) return 'collaboration';
        
        return 'limited_time';
    }
    
    /**
     * 期限切れランキングをクリーンアップ
     */
    cleanupExpiredRankings() {
        const currentTime = Date.now();
        const cacheTimeout = this.settings.cacheTimeout;
        
        // 季節ランキングのクリーンアップ
        this.seasonalRankings.forEach((data, key) => {
            if (currentTime - data.lastUpdated > cacheTimeout) {
                this.seasonalRankings.delete(key);
            }
        });
        
        // リアルタイムランキングのクリーンアップ
        this.realtimeRankings.forEach((data, key) => {
            if (currentTime - data.lastUpdated > cacheTimeout) {
                this.realtimeRankings.delete(key);
            }
        });
    }
    
    /**
     * ランキング統計を取得
     */
    getRankingStatistics() {
        return {
            seasonalRankings: this.seasonalRankings.size,
            globalRankings: this.globalRankings.size,
            categoryRankings: this.categoryRankings.size,
            realtimeRankings: this.realtimeRankings.size,
            lastUpdate: Math.max(
                ...Array.from(this.globalRankings.values()).map(r => r.lastUpdated),
                ...Array.from(this.seasonalRankings.values()).map(r => r.lastUpdated),
                ...Array.from(this.categoryRankings.values()).map(r => r.lastUpdated)
            )
        };
    }
    
    /**
     * プレイヤースコアを更新（EventStageManager対応）
     */
    updatePlayerScore(playerId, score) {
        try {
            // 現在のランキングを更新
            const currentRanking = this.getRanking('global');
            if (currentRanking && currentRanking.rankings) {
                const playerEntry = currentRanking.rankings.find(entry => entry.playerId === playerId);
                if (playerEntry) {
                    playerEntry.totalScore = Math.max(playerEntry.totalScore, score);
                    playerEntry.bestScore = Math.max(playerEntry.bestScore, score);
                } else {
                    // 新しいプレイヤーエントリを追加
                    currentRanking.rankings.push({
                        playerId: playerId,
                        playerName: 'プレイヤー',
                        totalScore: score,
                        bestScore: score,
                        eventCount: 1,
                        averageScore: score,
                        globalPoints: this.calculateGlobalPoints({
                            totalScore: score,
                            eventCount: 1,
                            achievements: 0,
                            averageScore: score
                        })
                    });
                }
                
                // ランキングを再ソート
                currentRanking.rankings.sort((a, b) => b.totalScore - a.totalScore);
                currentRanking.rankings.forEach((player, index) => {
                    player.rank = index + 1;
                });
            }
            
            console.log(`[EventRankingSystem] プレイヤースコア更新: ${playerId} = ${score}`);
        } catch (error) {
            console.error('[EventRankingSystem] updatePlayerScore error:', error);
        }
    }

    /**
     * リソースクリーンアップ
     */
    dispose() {
        if (this.rankingUpdateInterval) {
            clearInterval(this.rankingUpdateInterval);
            this.rankingUpdateInterval = null;
        }
        
        this.saveRankingData();
        
        // 基底クラスのdisposeを呼び出し
        if (super.dispose) {
            super.dispose();
        }
        
        console.log('EventRankingSystem disposed');
    }
}