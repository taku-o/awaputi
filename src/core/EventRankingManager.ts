// TypeScript conversion - basic types
interface BasicConfig {
    [key: string]: any;
}
/**
 * EventRankingManager - イベントランキングシステム
 * イベント別のランキング管理、リーダーボード機能、ランキング報酬配布を担当
 */
export class EventRankingManager {
    private gameEngine: any;
    private eventRankings: any;
    private playerRankings: any;
    private leaderboards: any;
    private maxLeaderboardSize: number;
    private rankingUpdateInterval: number;
    private rankingTiers: any[];
    private leaderboardCache: Map<string, any>;
    private cacheExpiry: number;
    private updateTimer: any;
    private rewardDistributionHistory: any;
    
    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        
        // ランキングデータ
        this.eventRankings = {}; // eventId -> ranking data
        this.playerRankings = {}; // playerId -> player ranking data
        this.leaderboards = {}; // eventId -> leaderboard cache
        
        // ランキング設定
        this.maxLeaderboardSize = 100; // リーダーボード最大表示数
        this.rankingUpdateInterval = 30000; // 30秒ごとに更新
        this.rankingTiers = this.initializeRankingTiers();
        
        // キャッシュとタイマー
        this.leaderboardCache = new Map();
        this.cacheExpiry = 60000; // 1分間キャッシュ
        this.updateTimer = null;
        
        this.initialize();
    }
    
    /**
     * ランキングシステムを初期化
     */
    initialize(): void {
        this.load();
        this.startPeriodicUpdates();
        console.log('EventRankingManager initialized');
    }
    
    /**
     * ランキングティア（階級）を初期化
     */
    initializeRankingTiers(): any[] {
        return [
            {
                name: 'Legend',
                minRank: 1,
                maxRank: 3,
                icon: '👑',
                color: '#FFD700',
                rewards: { ap: 1000, items: ['legend_crown', 'golden_trophy'] }
            },
            {
                name: 'Master',
                minRank: 4,
                maxRank: 10,
                icon: '💎',
                color: '#C0C0C0',
                rewards: { ap: 500, items: ['master_medal', 'silver_trophy'] }
            },
            {
                name: 'Expert',
                minRank: 11,
                maxRank: 25,
                icon: '🥇',
                color: '#CD7F32',
                rewards: { ap: 300, items: ['expert_badge', 'bronze_trophy'] }
            },
            {
                name: 'Advanced',
                minRank: 26,
                maxRank: 50,
                icon: '🥈',
                color: '#4682B4',
                rewards: { ap: 150, items: ['advanced_certificate'] }
            },
            {
                name: 'Intermediate',
                minRank: 51,
                maxRank: 100,
                icon: '🥉',
                color: '#228B22',
                rewards: { ap: 75, items: ['participation_badge'] }
            }
        ];
    }
    
    /**
     * イベントランキングを更新
     */
    updateEventRanking(eventId: any, playerId: any, score: any, stats: any): boolean {
        if (!eventId || !playerId || typeof score !== 'number') {
            console.warn('Invalid parameters for updateEventRanking');
            return false;
        }
        
        // イベントランキングデータを初期化（必要な場合）
        if (!this.eventRankings[eventId]) {
            this.eventRankings[eventId] = {
                eventId,
                players: {},
                lastUpdate: Date.now(),
                totalParticipants: 0,
                averageScore: 0,
                topScore: 0
            };
        }
        
        const ranking = this.eventRankings[eventId];
        const previousScore = ranking.players[playerId]?.score || 0;
        const isNewPlayer = !ranking.players[playerId];
        
        // プレイヤーのベストスコアを更新
        if (!ranking.players[playerId] || score > previousScore) {
            ranking.players[playerId] = {
                playerId,
                playerName: this.getPlayerName(playerId),
                score,
                stats: { ...stats },
                timestamp: Date.now(),
                rank: 0, // 後で計算
                improved: score > previousScore
            };
            
            // 新規参加者の場合
            if (isNewPlayer) {
                ranking.totalParticipants++;
            }
            
            // ランキングの再計算
            this.recalculateRanking(eventId);
            
            // キャッシュをクリア
            this.clearLeaderboardCache(eventId);
            
            // 統計を更新
            this.updateEventStatistics(eventId);
            
            // プレイヤーランキング履歴を更新
            this.updatePlayerRankingHistory(playerId, eventId, score, stats);
            
            console.log(`Ranking updated for ${playerId} in ${eventId}: ${score} points`);
            return true;
        }
        
        return false;
    }
    
    /**
     * ランキングを再計算
     */
    recalculateRanking(eventId: any): void {
        const ranking = this.eventRankings[eventId];
        if (!ranking) return;
        
        // スコア順にソート
        const sortedPlayers = Object.values(ranking.players)
            .sort((a: any, b: any) => {
                // スコア降順、同スコアなら早い時刻順
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timestamp - b.timestamp;
            });
        
        // ランクを設定
        sortedPlayers.forEach((player: any, index: number) => {
            player.rank = index + 1;
            player.tier = this.getTierForRank(player.rank);
        });
        
        ranking.lastUpdate = Date.now();
    }
    
    /**
     * ランクに対応するティアを取得
     */
    getTierForRank(rank: any): any {
        for (const tier of this.rankingTiers) {
            if (rank >= tier.minRank && rank <= tier.maxRank) {
                return tier;
            }
        }
        return null;
    }
    
    /**
     * イベントリーダーボードを取得
     */
    getEventLeaderboard(eventId: any, limit = 10, offset = 0): any {
        // キャッシュチェック
        const cacheKey = `${eventId}_${limit}_${offset}`;
        const cached = this.leaderboardCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        
        const ranking = this.eventRankings[eventId];
        if (!ranking) {
            return {
                eventId,
                players: [],
                totalParticipants: 0,
                averageScore: 0,
                topScore: 0,
                lastUpdate: Date.now()
            };
        }
        
        // ランキング順にソートされたプレイヤーリストを取得
        const sortedPlayers = Object.values(ranking.players)
            .sort((a: any, b: any) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.timestamp - b.timestamp;
            })
            .slice(offset, offset + limit)
            .map((player: any) => ({
                ...player,
                tierInfo: this.getTierForRank(player.rank)
            }));

        const leaderboard = {
            eventId,
            players: sortedPlayers,
            totalParticipants: ranking.totalParticipants,
            averageScore: ranking.averageScore,
            topScore: ranking.topScore,
            lastUpdate: ranking.lastUpdate
        };
        
        // キャッシュに保存
        this.leaderboardCache.set(cacheKey, {
            data: leaderboard,
            timestamp: Date.now()
        });
        
        return leaderboard;
    }
    
    /**
     * プレイヤーの特定イベントでのランキング情報を取得
     */
    getPlayerEventRanking(playerId: any, eventId: any): any {
        const ranking = this.eventRankings[eventId];
        if (!ranking || !ranking.players[playerId]) {
            return null;
        }
        
        const playerData = ranking.players[playerId];
        return {
            ...playerData,
            tierInfo: this.getTierForRank(playerData.rank),
            percentile: this.calculatePercentile(playerData.rank, ranking.totalParticipants)
        };
    }
    
    /**
     * パーセンタイルを計算
     */
    calculatePercentile(rank: any, totalParticipants: any): number {
        if (totalParticipants <= 1) return 100;
        return Math.round(((totalParticipants - rank) / (totalParticipants - 1)) * 100);
    }
    
    /**
     * ランキング報酬を配布
     */
    distributeRankingRewards(eventId: any): boolean {
        const ranking = this.eventRankings[eventId];
        if (!ranking) {
            console.warn(`No ranking data found for event: ${eventId}`);
            return false;
        }
        
        const rewardedPlayers: any[] = [];
        
        Object.values(ranking.players).forEach((player: any) => {
            const tier = this.getTierForRank(player.rank);
            if (tier && tier.rewards) {
                // 報酬を付与
                const rewards = this.grantRankingRewards(player.playerId, eventId, tier.rewards, player.rank);
                rewardedPlayers.push({
                    playerId: player.playerId,
                    playerName: player.playerName,
                    rank: player.rank,
                    tier: tier.name,
                    rewards: rewards
                });
                // 通知を送信
                this.sendRankingRewardNotification(player.playerId, eventId, tier, player.rank, rewards);
            }
        });
        
        // 報酬配布の記録
        this.recordRankingRewardDistribution(eventId, rewardedPlayers);
        
        console.log(`Ranking rewards distributed for ${eventId}: ${rewardedPlayers.length} players rewarded`);
        return true;
    }
    
    /**
     * ランキング報酬を付与
     */
    grantRankingRewards(playerId: any, eventId: any, tierRewards: any, rank: any): any {
        const rewards = {
            ap: tierRewards.ap || 0,
            items: [...(tierRewards.items || [])],
            special: []
        };
        // 特別報酬（1位のみ）
        if (rank === 1) {
            rewards.special.push(`${eventId}_champion_title`);
            rewards.ap = Math.floor(rewards.ap * 1.5); // チャンピオンボーナス
        }
        
        // 報酬を実際に付与
        if (rewards.ap > 0) {
            this.gameEngine.playerData.ap += rewards.ap;
            this.gameEngine.playerData.tap += rewards.ap;
        }
        
        rewards.items.forEach((item: any) => {
            this.gameEngine.playerData.addItem(item);
        });
        
        rewards.special.forEach((special: any) => {
            this.gameEngine.playerData.addSpecialReward(special);
        });
        
        return rewards;
    }
    
    /**
     * ランキング報酬通知を送信
     */
    sendRankingRewardNotification(playerId: any, eventId: any, tier: any, rank: any, rewards: any): void {
        if (!this.gameEngine.achievementNotificationSystem) return;
        const message = `${tier.name}ランク達成！ (${rank}位)`;
        const rewardText = [];
        
        if (rewards.ap > 0) rewardText.push(`${rewards.ap} AP`);
        if (rewards.items.length > 0) rewardText.push(`${rewards.items.length}個のアイテム`);
        if (rewards.special.length > 0) rewardText.push('特別報酬');
        
        this.gameEngine.achievementNotificationSystem.queueNotification({
            type: 'ranking',
            title: 'ランキング報酬！',
            message: `${message}\n${rewardText.join('、')}を獲得`,
            icon: tier.icon,
            duration: 6000
        });
    }
    
    /**
     * イベント統計を更新
     */
    updateEventStatistics(eventId: any): void {
        const ranking = this.eventRankings[eventId];
        if (!ranking) return;
        
        const scores = Object.values(ranking.players).map((p: any) => p.score);
        ranking.averageScore = scores.length > 0
            ? Math.round(scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length)
            : 0;
        ranking.topScore = scores.length > 0 ? Math.max(...scores) : 0;
    }
    
    /**
     * プレイヤーランキング履歴を更新
     */
    updatePlayerRankingHistory(playerId: any, eventId: any, score: any, stats: any): void {
        if (!this.playerRankings[playerId]) {
            this.playerRankings[playerId] = {
                playerId,
                eventHistory: {},
                totalEvents: 0,
                bestRanks: {},
                averageRank: 0
            };
        }
        
        const playerRanking = this.playerRankings[playerId];
        
        // イベント履歴を更新
        if (!playerRanking.eventHistory[eventId]) {
            playerRanking.totalEvents++;
        }
        
        playerRanking.eventHistory[eventId] = {
            eventId,
            bestScore: score,
            bestStats: stats,
            participationCount: (playerRanking.eventHistory[eventId]?.participationCount || 0) + 1,
            lastParticipation: Date.now()
        };
    }
    
    /**
     * 定期的なランキング更新を開始
     */
    startPeriodicUpdates(): void {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        
        this.updateTimer = setInterval(() => {
            // すべてのアクティブなイベントのランキングを更新
            Object.keys(this.eventRankings).forEach(eventId => {
                if (this.gameEngine.eventStageManager?.isEventAvailable(eventId)) {
                    this.recalculateRanking(eventId);
                }
            });
        }, this.rankingUpdateInterval);
    }
    
    /**
     * 定期的な更新を停止
     */
    stopPeriodicUpdates(): void {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
    
    /**
     * リーダーボードキャッシュをクリア
     */
    clearLeaderboardCache(eventId: any = null): void {
        if (eventId) {
            // 特定イベントのキャッシュのみクリア
            for (const key of this.leaderboardCache.keys()) {
                if (key.startsWith(eventId)) {
                    this.leaderboardCache.delete(key);
                }
            }
        } else {
            // 全キャッシュをクリア
            this.leaderboardCache.clear();
        }
    }
    
    /**
     * プレイヤー名を取得
     */
    getPlayerName(playerId: any): string {
        return this.gameEngine.playerData?.getPlayerName() || `Player_${playerId.slice(-6)}`;
    }
    
    /**
     * 報酬配布記録
     */
    recordRankingRewardDistribution(eventId: any, rewardedPlayers: any): void {
        this.rewardDistributionHistory = this.rewardDistributionHistory || {};
        this.rewardDistributionHistory[eventId] = {
            eventId,
            distributionDate: Date.now(),
            rewardedPlayers: rewardedPlayers.length,
            playerRewards: rewardedPlayers
        };
        this.save();
    }
    
    /**
     * データを保存
     */
    save(): void {
        try {
            const data = {
                eventRankings: this.eventRankings,
                playerRankings: this.playerRankings,
                rewardDistributionHistory: this.rewardDistributionHistory
            };
            localStorage.setItem('eventRankingData', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save ranking data:', error);
        }
    }
    
    /**
     * データを読み込み
     */
    load(): void {
        try {
            const data = localStorage.getItem('eventRankingData');
            if (data) {
                const parsed = JSON.parse(data);
                this.eventRankings = parsed.eventRankings || {};
                this.playerRankings = parsed.playerRankings || {};
                this.rewardDistributionHistory = parsed.rewardDistributionHistory || {};
            }
        } catch (error) {
            console.error('Failed to load ranking data:', error);
            this.eventRankings = {};
            this.playerRankings = {};
            this.rewardDistributionHistory = {};
        }
    }
    
    /**
     * ランキングデータをリセット
     */
    reset(): void {
        this.eventRankings = {};
        this.playerRankings = {};
        this.rewardDistributionHistory = {};
        
        this.clearLeaderboardCache();
        this.save();
        console.log('Ranking data reset');
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.stopPeriodicUpdates();
        this.clearLeaderboardCache();
        this.save();
    }
}