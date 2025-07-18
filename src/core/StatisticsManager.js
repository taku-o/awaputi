/**
 * 統計管理クラス
 */
export class StatisticsManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.statistics = this.initializeStatistics();
        this.sessionStats = this.initializeSessionStats();
        this.gameStartTime = null;
        this.lowHpStartTime = null;
    }
    
    /**
     * 統計データを初期化
     */
    initializeStatistics() {
        return {
            // 基本統計
            totalGamesPlayed: 0,
            totalPlayTime: 0,
            totalScore: 0,
            highestScore: 0,
            averageScore: 0,
            
            // 泡統計
            totalBubblesPopped: 0,
            totalBubblesMissed: 0,
            bubbleAccuracy: 0,
            bubbleTypeStats: {
                normal: 0,
                stone: 0,
                iron: 0,
                diamond: 0,
                pink: 0,
                poison: 0,
                spiky: 0,
                rainbow: 0,
                clock: 0,
                score: 0,
                electric: 0,
                escaping: 0,
                cracked: 0,
                boss: 0,
                // 新しい泡タイプ
                golden: 0,
                frozen: 0,
                magnetic: 0,
                explosive: 0,
                phantom: 0,
                multiplier: 0
            },
            
            // コンボ統計
            totalCombos: 0,
            highestCombo: 0,
            averageCombo: 0,
            comboBreaks: 0,
            
            // HP統計
            totalDamageTaken: 0,
            totalHpHealed: 0,
            timesRevived: 0,
            lowHpTime: 0, // HP10以下の時間
            
            // ステージ統計
            stageStats: {},
            stagesCompleted: 0,
            stagesFailed: 0,
            
            // 特殊効果統計
            bonusTimeActivated: 0,
            timeStopActivated: 0,
            chainReactionsTriggered: 0,
            screenShakesTriggered: 0,
            
            // 新しい効果統計
            scoreMultipliersUsed: 0,
            magneticPullsTriggered: 0,
            bigExplosionsTriggered: 0,
            phantomPhases: 0,
            
            // プレイスタイル統計
            clicksPerMinute: 0,
            averageReactionTime: 0,
            dragOperations: 0,
            perfectGames: 0,
            
            // 時間統計
            playTimeByHour: new Array(24).fill(0),
            playTimeByDay: new Array(7).fill(0),
            longestSession: 0,
            shortestSession: Infinity,
            
            // 進歩統計
            apEarned: 0,
            apSpent: 0,
            itemsPurchased: 0,
            achievementsUnlocked: 0
        };
    }
    
    /**
     * セッション統計を初期化
     */
    initializeSessionStats() {
        return {
            gamesThisSession: 0,
            scoreThisSession: 0,
            bubblesThisSession: 0,
            playTimeThisSession: 0,
            sessionStartTime: Date.now()
        };
    }
    
    /**
     * ゲーム開始時の統計更新
     */
    onGameStart(stageId) {
        this.gameStartTime = Date.now();
        this.statistics.totalGamesPlayed++;
        this.sessionStats.gamesThisSession++;
        
        // ステージ統計を初期化
        if (!this.statistics.stageStats[stageId]) {
            this.statistics.stageStats[stageId] = {
                gamesPlayed: 0,
                gamesCompleted: 0,
                totalScore: 0,
                highScore: 0,
                totalPlayTime: 0,
                bubblesPopped: 0
            };
        }
        
        this.statistics.stageStats[stageId].gamesPlayed++;
        
        // 時間統計を更新
        const now = new Date();
        this.statistics.playTimeByHour[now.getHours()]++;
        this.statistics.playTimeByDay[now.getDay()]++;
    }
    
    /**
     * ゲーム終了時の統計更新
     */
    onGameEnd(data) {
        const playTime = Date.now() - this.gameStartTime;
        const { finalScore, stageId, bubblesPopped, bubblesMissed, maxCombo, completed } = data;
        
        // 基本統計更新
        this.statistics.totalPlayTime += playTime;
        this.statistics.totalScore += finalScore;
        this.statistics.highestScore = Math.max(this.statistics.highestScore, finalScore);
        this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;
        
        // 泡統計更新
        this.statistics.totalBubblesPopped += bubblesPopped;
        this.statistics.totalBubblesMissed += bubblesMissed;
        this.statistics.bubbleAccuracy = 
            (this.statistics.totalBubblesPopped / (this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed)) * 100;
        
        // コンボ統計更新
        this.statistics.highestCombo = Math.max(this.statistics.highestCombo, maxCombo);
        this.statistics.totalCombos += maxCombo;
        this.statistics.averageCombo = this.statistics.totalCombos / this.statistics.totalGamesPlayed;
        
        // ステージ統計更新
        const stageStats = this.statistics.stageStats[stageId];
        stageStats.totalScore += finalScore;
        stageStats.highScore = Math.max(stageStats.highScore, finalScore);
        stageStats.totalPlayTime += playTime;
        stageStats.bubblesPopped += bubblesPopped;
        
        if (completed) {
            stageStats.gamesCompleted++;
            this.statistics.stagesCompleted++;
            
            // パーフェクトゲーム判定
            if (bubblesMissed === 0 && bubblesPopped >= 50) {
                this.statistics.perfectGames++;
            }
        } else {
            this.statistics.stagesFailed++;
        }
        
        // セッション統計更新
        this.sessionStats.scoreThisSession += finalScore;
        this.sessionStats.bubblesThisSession += bubblesPopped;
        this.sessionStats.playTimeThisSession += playTime;
        
        // セッション時間統計
        this.statistics.longestSession = Math.max(this.statistics.longestSession, playTime);
        this.statistics.shortestSession = Math.min(this.statistics.shortestSession, playTime);
        
        this.save();
    }
    
    /**
     * 泡が割れた時の統計更新
     */
    onBubblePopped(bubbleType, reactionTime) {
        this.statistics.bubbleTypeStats[bubbleType]++;
        
        // 反応時間統計
        if (reactionTime) {
            const currentAvg = this.statistics.averageReactionTime;
            const totalBubbles = this.statistics.totalBubblesPopped;
            this.statistics.averageReactionTime = 
                (currentAvg * (totalBubbles - 1) + reactionTime) / totalBubbles;
        }
    }
    
    /**
     * コンボ更新時の統計更新
     */
    onComboUpdate(combo, broken = false) {
        if (broken) {
            this.statistics.comboBreaks++;
        }
    }
    
    /**
     * ダメージを受けた時の統計更新
     */
    onDamageTaken(damage) {
        this.statistics.totalDamageTaken += damage;
        
        // 低HP状態の追跡開始
        if (this.gameEngine.playerData.currentHP <= 10 && !this.lowHpStartTime) {
            this.lowHpStartTime = Date.now();
        }
    }
    
    /**
     * HP回復時の統計更新
     */
    onHpHealed(healAmount) {
        this.statistics.totalHpHealed += healAmount;
        
        // 低HP状態の追跡終了
        if (this.gameEngine.playerData.currentHP > 10 && this.lowHpStartTime) {
            this.statistics.lowHpTime += Date.now() - this.lowHpStartTime;
            this.lowHpStartTime = null;
        }
    }
    
    /**
     * 復活時の統計更新
     */
    onRevived() {
        this.statistics.timesRevived++;
    }
    
    /**
     * 特殊効果発動時の統計更新
     */
    onSpecialEffect(effectType) {
        switch (effectType) {
            case 'rainbow':
                this.statistics.bonusTimeActivated++;
                break;
            case 'clock':
                this.statistics.timeStopActivated++;
                break;
            case 'spiky':
                this.statistics.chainReactionsTriggered++;
                break;
            case 'electric':
                this.statistics.screenShakesTriggered++;
                break;
            case 'golden':
                this.statistics.scoreMultipliersUsed++;
                break;
            case 'magnetic':
                this.statistics.magneticPullsTriggered++;
                break;
            case 'explosive':
                this.statistics.bigExplosionsTriggered++;
                break;
            case 'phantom':
                this.statistics.phantomPhases++;
                break;
        }
    }
    
    /**
     * ドラッグ操作時の統計更新
     */
    onDragOperation() {
        this.statistics.dragOperations++;
    }
    
    /**
     * アイテム購入時の統計更新
     */
    onItemPurchased(cost) {
        this.statistics.itemsPurchased++;
        this.statistics.apSpent += cost;
    }
    
    /**
     * AP獲得時の統計更新
     */
    onApEarned(amount) {
        this.statistics.apEarned += amount;
    }
    
    /**
     * 実績解除時の統計更新
     */
    onAchievementUnlocked() {
        this.statistics.achievementsUnlocked++;
    }
    
    /**
     * 詳細統計を取得
     */
    getDetailedStatistics() {
        const sessionTime = Date.now() - this.sessionStats.sessionStartTime;
        
        return {
            // 基本統計
            basic: {
                totalGamesPlayed: this.statistics.totalGamesPlayed,
                totalPlayTime: this.formatTime(this.statistics.totalPlayTime),
                totalScore: this.statistics.totalScore,
                highestScore: this.statistics.highestScore,
                averageScore: Math.round(this.statistics.averageScore),
                completionRate: this.statistics.stagesCompleted / (this.statistics.stagesCompleted + this.statistics.stagesFailed) * 100
            },
            
            // 泡統計
            bubbles: {
                totalPopped: this.statistics.totalBubblesPopped,
                totalMissed: this.statistics.totalBubblesMissed,
                accuracy: this.statistics.bubbleAccuracy.toFixed(1) + '%',
                typeBreakdown: this.statistics.bubbleTypeStats,
                favoriteType: this.getFavoriteBubbleType(),
                averageReactionTime: this.statistics.averageReactionTime.toFixed(0) + 'ms'
            },
            
            // コンボ統計
            combos: {
                highestCombo: this.statistics.highestCombo,
                averageCombo: this.statistics.averageCombo.toFixed(1),
                totalCombos: this.statistics.totalCombos,
                comboBreaks: this.statistics.comboBreaks,
                comboSuccessRate: ((this.statistics.totalCombos - this.statistics.comboBreaks) / this.statistics.totalCombos * 100).toFixed(1) + '%'
            },
            
            // HP統計
            health: {
                totalDamageTaken: this.statistics.totalDamageTaken,
                totalHpHealed: this.statistics.totalHpHealed,
                timesRevived: this.statistics.timesRevived,
                lowHpTime: this.formatTime(this.statistics.lowHpTime),
                survivalRate: (this.statistics.stagesCompleted / this.statistics.totalGamesPlayed * 100).toFixed(1) + '%'
            },
            
            // ステージ統計
            stages: {
                completed: this.statistics.stagesCompleted,
                failed: this.statistics.stagesFailed,
                stageBreakdown: this.statistics.stageStats,
                favoriteStage: this.getFavoriteStage()
            },
            
            // 特殊効果統計
            effects: {
                bonusTimeActivated: this.statistics.bonusTimeActivated,
                timeStopActivated: this.statistics.timeStopActivated,
                chainReactions: this.statistics.chainReactionsTriggered,
                screenShakes: this.statistics.screenShakesTriggered,
                scoreMultipliers: this.statistics.scoreMultipliersUsed,
                magneticPulls: this.statistics.magneticPullsTriggered,
                bigExplosions: this.statistics.bigExplosionsTriggered,
                phantomPhases: this.statistics.phantomPhases
            },
            
            // プレイスタイル統計
            playstyle: {
                clicksPerMinute: this.calculateClicksPerMinute(),
                dragOperations: this.statistics.dragOperations,
                perfectGames: this.statistics.perfectGames,
                playTimeDistribution: this.getPlayTimeDistribution()
            },
            
            // セッション統計
            session: {
                gamesThisSession: this.sessionStats.gamesThisSession,
                scoreThisSession: this.sessionStats.scoreThisSession,
                bubblesThisSession: this.sessionStats.bubblesThisSession,
                sessionTime: this.formatTime(sessionTime),
                averageScoreThisSession: this.sessionStats.gamesThisSession > 0 ? 
                    Math.round(this.sessionStats.scoreThisSession / this.sessionStats.gamesThisSession) : 0
            },
            
            // 進歩統計
            progress: {
                apEarned: this.statistics.apEarned,
                apSpent: this.statistics.apSpent,
                itemsPurchased: this.statistics.itemsPurchased,
                achievementsUnlocked: this.statistics.achievementsUnlocked,
                efficiency: this.statistics.apEarned > 0 ? 
                    (this.statistics.totalScore / this.statistics.apEarned).toFixed(2) : 0
            }
        };
    }
    
    /**
     * お気に入りの泡タイプを取得
     */
    getFavoriteBubbleType() {
        let maxCount = 0;
        let favoriteType = 'normal';
        
        Object.entries(this.statistics.bubbleTypeStats).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteType = type;
            }
        });
        
        return { type: favoriteType, count: maxCount };
    }
    
    /**
     * お気に入りのステージを取得
     */
    getFavoriteStage() {
        let maxGames = 0;
        let favoriteStage = null;
        
        Object.entries(this.statistics.stageStats).forEach(([stageId, stats]) => {
            if (stats.gamesPlayed > maxGames) {
                maxGames = stats.gamesPlayed;
                favoriteStage = stageId;
            }
        });
        
        return { stage: favoriteStage, games: maxGames };
    }
    
    /**
     * 1分あたりのクリック数を計算
     */
    calculateClicksPerMinute() {
        if (this.statistics.totalPlayTime === 0) return 0;
        return Math.round(this.statistics.totalBubblesPopped / (this.statistics.totalPlayTime / 60000));
    }
    
    /**
     * プレイ時間分布を取得
     */
    getPlayTimeDistribution() {
        return {
            byHour: this.statistics.playTimeByHour,
            byDay: this.statistics.playTimeByDay,
            peakHour: this.statistics.playTimeByHour.indexOf(Math.max(...this.statistics.playTimeByHour)),
            peakDay: this.statistics.playTimeByDay.indexOf(Math.max(...this.statistics.playTimeByDay))
        };
    }
    
    /**
     * 時間をフォーマット
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}時間${minutes % 60}分`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    /**
     * ランキング情報を取得
     */
    getRankings() {
        // 簡単なランキングシステム（将来的にはサーバーサイドで実装）
        const rankings = {
            score: this.statistics.highestScore,
            bubbles: this.statistics.totalBubblesPopped,
            combo: this.statistics.highestCombo,
            playtime: this.statistics.totalPlayTime,
            achievements: this.statistics.achievementsUnlocked
        };
        
        return rankings;
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            localStorage.setItem('bubblePop_statistics', JSON.stringify(this.statistics));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }
    
    /**
     * データを読み込み
     */
    load() {
        try {
            const savedData = localStorage.getItem('bubblePop_statistics');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.statistics = { ...this.initializeStatistics(), ...data };
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
            this.statistics = this.initializeStatistics();
        }
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.statistics = this.initializeStatistics();
        this.sessionStats = this.initializeSessionStats();
        this.save();
    }
}