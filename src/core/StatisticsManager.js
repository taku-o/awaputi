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
        
        // StatisticsCollectorの統合（遅延読み込み）
        this.collector = null;
        this.initializeCollector();
        
        // TimeSeriesDataManagerの統合（遅延読み込み）
        this.timeSeriesManager = null;
        this.initializeTimeSeriesManager();
        
        // StatisticsAnalyzerの統合（遅延読み込み）
        this.analyzer = null;
        this.initializeAnalyzer();
    }
    
    /**
     * StatisticsCollectorの初期化
     */
    async initializeCollector() {
        try {
            const { StatisticsCollector } = await import('./StatisticsCollector.js');
            this.collector = new StatisticsCollector(this);
        } catch (error) {
            console.warn('StatisticsCollector not available, using fallback mode:', error);
        }
    }
    
    /**
     * TimeSeriesDataManagerの初期化
     */
    async initializeTimeSeriesManager() {
        try {
            const { TimeSeriesDataManager } = await import('./TimeSeriesDataManager.js');
            this.timeSeriesManager = new TimeSeriesDataManager();
        } catch (error) {
            console.warn('TimeSeriesDataManager not available, using fallback mode:', error);
        }
    }
    
    /**
     * StatisticsAnalyzerの初期化
     */
    async initializeAnalyzer() {
        try {
            const { StatisticsAnalyzer } = await import('./StatisticsAnalyzer.js');
            this.analyzer = new StatisticsAnalyzer(this);
        } catch (error) {
            console.warn('StatisticsAnalyzer not available, using fallback mode:', error);
        }
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
            longestSession: 0,
            shortestSession: Infinity,
            averageSessionLength: 0,
            sessionsToday: 0,
            
            // スコア分布統計（新規追加）
            scoreDistribution: {
                '0-1000': 0,
                '1001-5000': 0,
                '5001-10000': 0,
                '10001-25000': 0,
                '25001-50000': 0,
                '50001+': 0
            },
            
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
            
            // 効率統計（新規追加）
            efficiencyStats: {
                bubblesPerMinute: 0,
                bubblesPerSecond: 0,
                peakEfficiency: 0,
                efficiencyTrend: [],
                bestEfficiencySession: 0,
                worstEfficiencySession: Infinity
            },
            
            // 反応時間統計（新規追加）
            reactionTimeStats: {
                average: 0,
                fastest: Infinity,
                slowest: 0,
                distribution: {
                    'under_200ms': 0,
                    '200_500ms': 0,
                    '500_1000ms': 0,
                    'over_1000ms': 0
                },
                recentTimes: [] // 最新100回の反応時間
            },
            
            // コンボ統計
            totalCombos: 0,
            highestCombo: 0,
            averageCombo: 0,
            comboBreaks: 0,
            
            // コンボ詳細統計（新規追加）
            comboDetailStats: {
                comboRanges: {
                    '1-5': 0,
                    '6-10': 0,
                    '11-20': 0,
                    '21-50': 0,
                    '51+': 0
                },
                comboSuccessRate: 0,
                averageComboLength: 0,
                longestComboStreak: 0,
                comboRecoveryTime: 0 // コンボが切れてから次のコンボまでの時間
            },
            
            // HP統計
            totalDamageTaken: 0,
            totalHpHealed: 0,
            timesRevived: 0,
            lowHpTime: 0, // HP10以下の時間
            
            // HP詳細統計（新規追加）
            hpDetailStats: {
                criticalHpEvents: 0, // HP5以下になった回数
                nearDeathRecoveries: 0, // HP1から回復した回数
                perfectHealthGames: 0, // ダメージを受けなかったゲーム数
                averageDamagePerGame: 0,
                maxDamageInSingleGame: 0,
                healingEfficiency: 0 // 回復量/ダメージ量
            },
            
            // ステージ統計
            stageStats: {},
            stagesCompleted: 0,
            stagesFailed: 0,
            
            // ステージ詳細統計（新規追加）
            stageDetailStats: {
                favoriteStage: null,
                mostDifficultStage: null,
                fastestClearTime: {},
                averageClearTime: {},
                stageRetryCount: {},
                stageCompletionRate: {},
                stagePerfectionRate: {} // ステージ別パーフェクト達成率
            },
            
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
            
            // 特殊効果詳細統計（新規追加）
            specialEffectDetailStats: {
                effectUsageRates: {}, // 効果別使用率
                effectSuccessRates: {}, // 効果別成功率
                mostEffectiveEffect: null,
                totalEffectDuration: 0,
                effectChainCombos: 0 // 効果を連続で発動した回数
            },
            
            // プレイスタイル統計
            clicksPerMinute: 0,
            averageReactionTime: 0,
            dragOperations: 0,
            perfectGames: 0,
            
            // プレイスタイル詳細統計（新規追加）
            playStyleDetailStats: {
                clickPattern: {
                    clicksPerMinute: 0,
                    burstClicking: 0, // 短時間で多数クリック
                    steadyClicking: 0, // 安定したクリック
                    pauseFrequency: 0 // 一時停止の頻度
                },
                strategyAnalysis: {
                    priorityTargeting: 0, // 特殊泡を優先する傾向
                    comboFocus: 0, // コンボを重視する傾向
                    survivalFocus: 0 // 生存を重視する傾向
                },
                adaptability: {
                    difficultyAdjustment: 0,
                    learningCurve: 0,
                    consistencyScore: 0
                },
                mouseMovementStats: {
                    totalDistance: 0,
                    averageSpeed: 0,
                    accuracyRatio: 0
                }
            },
            
            // 時間統計
            playTimeByHour: new Array(24).fill(0),
            playTimeByDay: new Array(7).fill(0),
            
            // 時間詳細統計（新規追加）
            timeDetailStats: {
                playTimeByMonth: {},
                playTimeByYear: {},
                peakHour: 0,
                peakDay: 0,
                playingStreaks: {
                    currentStreak: 0,
                    longestStreak: 0,
                    streakHistory: []
                },
                sessionGaps: {
                    averageGap: 0,
                    longestGap: 0,
                    shortestGap: Infinity
                }
            },
            
            // 進歩統計
            apEarned: 0,
            apSpent: 0,
            itemsPurchased: 0,
            achievementsUnlocked: 0,
            
            // 進歩詳細統計（新規追加）
            progressDetailStats: {
                apEarningRate: 0, // 時間あたりのAP獲得率
                spendingEfficiency: 0, // AP支出効率
                itemUsageStats: {},
                achievementProgress: {},
                milestones: [], // 達成したマイルストーン
                growthTrends: {
                    scoreImprovement: {
                        daily: 0,
                        weekly: 0,
                        monthly: 0,
                        trend: 'stable' // 'improving', 'stable', 'declining'
                    },
                    skillImprovement: {
                        accuracyImprovement: 0,
                        speedImprovement: 0,
                        consistencyImprovement: 0
                    }
                }
            },
            
            // エラー・デバッグ統計（新規追加）
            errorStats: {
                gameErrors: 0,
                performanceIssues: 0,
                connectionIssues: 0,
                recoverySuccessRate: 0
            },
            
            // ソーシャル統計（新規追加、将来の機能用）
            socialStats: {
                shareCount: 0,
                challengesCompleted: 0,
                communityRank: 0,
                friendsConnected: 0
            }
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
        const { finalScore, stageId, bubblesPopped, bubblesMissed, maxCombo, completed, damage } = data;
        
        // 基本統計更新
        this.statistics.totalPlayTime += playTime;
        this.statistics.totalScore += finalScore;
        this.statistics.highestScore = Math.max(this.statistics.highestScore, finalScore);
        this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;
        
        // スコア分布統計更新
        this.updateScoreDistribution(finalScore);
        
        // セッション長統計更新
        this.updateSessionLengthStats(playTime);
        
        // 泡統計更新
        this.statistics.totalBubblesPopped += bubblesPopped;
        this.statistics.totalBubblesMissed += bubblesMissed;
        this.statistics.bubbleAccuracy = 
            (this.statistics.totalBubblesPopped / (this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed)) * 100;
        
        // コンボ統計更新
        this.statistics.highestCombo = Math.max(this.statistics.highestCombo, maxCombo);
        this.statistics.totalCombos += maxCombo;
        this.statistics.averageCombo = this.statistics.totalCombos / this.statistics.totalGamesPlayed;
        
        // コンボ詳細統計更新
        this.updateComboDetailStats(maxCombo);
        
        // HP詳細統計更新
        this.updateHpDetailStats(damage || 0, bubblesMissed === 0);
        
        // ステージ統計更新
        const stageStats = this.statistics.stageStats[stageId];
        stageStats.totalScore += finalScore;
        stageStats.highScore = Math.max(stageStats.highScore, finalScore);
        stageStats.totalPlayTime += playTime;
        stageStats.bubblesPopped += bubblesPopped;
        
        // ステージ詳細統計更新
        this.updateStageDetailStats(stageId, playTime, finalScore, completed);
        
        if (completed) {
            stageStats.gamesCompleted++;
            this.statistics.stagesCompleted++;
            
            // パーフェクトゲーム判定
            if (bubblesMissed === 0 && bubblesPopped >= 50) {
                this.statistics.perfectGames++;
                this.statistics.hpDetailStats.perfectHealthGames++;
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
        
        // 時間詳細統計更新
        this.updateTimeDetailStats();
        
        // 進歩詳細統計更新
        this.updateProgressDetailStats(finalScore, playTime);
        
        // 時系列データの記録
        this.recordTimeSeriesData(finalScore, playTime, completed);
        
        // StatisticsCollectorでのイベント収集
        if (this.collector) {
            this.collector.collectEvent('game_ended', data);
        }
        
        this.save();
    }
    
    /**
     * スコア分布統計の更新
     */
    updateScoreDistribution(score) {
        const dist = this.statistics.scoreDistribution;
        
        if (score <= 1000) {
            dist['0-1000']++;
        } else if (score <= 5000) {
            dist['1001-5000']++;
        } else if (score <= 10000) {
            dist['5001-10000']++;
        } else if (score <= 25000) {
            dist['10001-25000']++;
        } else if (score <= 50000) {
            dist['25001-50000']++;
        } else {
            dist['50001+']++;
        }
    }
    
    /**
     * セッション長統計の更新
     */
    updateSessionLengthStats(playTime) {
        const totalSessions = this.statistics.totalGamesPlayed;
        const currentAvg = this.statistics.averageSessionLength;
        
        this.statistics.averageSessionLength = 
            (currentAvg * (totalSessions - 1) + playTime) / totalSessions;
    }
    
    /**
     * コンボ詳細統計の更新
     */
    updateComboDetailStats(maxCombo) {
        const comboStats = this.statistics.comboDetailStats;
        
        // コンボ範囲別統計
        if (maxCombo <= 5) {
            comboStats.comboRanges['1-5']++;
        } else if (maxCombo <= 10) {
            comboStats.comboRanges['6-10']++;
        } else if (maxCombo <= 20) {
            comboStats.comboRanges['11-20']++;
        } else if (maxCombo <= 50) {
            comboStats.comboRanges['21-50']++;
        } else {
            comboStats.comboRanges['51+']++;
        }
        
        // 最長コンボストリーク更新
        comboStats.longestComboStreak = Math.max(comboStats.longestComboStreak, maxCombo);
        
        // 平均コンボ長更新
        const totalCombos = this.statistics.totalCombos;
        const gamesPlayed = this.statistics.totalGamesPlayed;
        comboStats.averageComboLength = totalCombos / gamesPlayed;
        
        // コンボ成功率計算
        const totalComboAttempts = totalCombos + this.statistics.comboBreaks;
        comboStats.comboSuccessRate = totalComboAttempts > 0 ? 
            (totalCombos / totalComboAttempts) * 100 : 0;
    }
    
    /**
     * HP詳細統計の更新
     */
    updateHpDetailStats(gameDamage, perfectHealth) {
        const hpStats = this.statistics.hpDetailStats;
        
        if (perfectHealth) {
            hpStats.perfectHealthGames++;
        }
        
        if (gameDamage > 0) {
            hpStats.maxDamageInSingleGame = Math.max(hpStats.maxDamageInSingleGame, gameDamage);
            
            const totalGames = this.statistics.totalGamesPlayed;
            const currentAvg = hpStats.averageDamagePerGame;
            hpStats.averageDamagePerGame = 
                (currentAvg * (totalGames - 1) + gameDamage) / totalGames;
        }
        
        // 回復効率計算
        if (this.statistics.totalDamageTaken > 0) {
            hpStats.healingEfficiency = 
                this.statistics.totalHpHealed / this.statistics.totalDamageTaken;
        }
    }
    
    /**
     * ステージ詳細統計の更新
     */
    updateStageDetailStats(stageId, playTime, score, completed) {
        const stageDetailStats = this.statistics.stageDetailStats;
        
        // 最速クリア時間更新
        if (completed) {
            if (!stageDetailStats.fastestClearTime[stageId] || 
                playTime < stageDetailStats.fastestClearTime[stageId]) {
                stageDetailStats.fastestClearTime[stageId] = playTime;
            }
        }
        
        // 平均クリア時間更新
        if (!stageDetailStats.averageClearTime[stageId]) {
            stageDetailStats.averageClearTime[stageId] = playTime;
        } else {
            const currentAvg = stageDetailStats.averageClearTime[stageId];
            const stageCompletions = this.statistics.stageStats[stageId].gamesCompleted;
            stageDetailStats.averageClearTime[stageId] = 
                (currentAvg * (stageCompletions - 1) + playTime) / stageCompletions;
        }
        
        // ステージ完了率更新
        const stageStats = this.statistics.stageStats[stageId];
        stageDetailStats.stageCompletionRate[stageId] = 
            (stageStats.gamesCompleted / stageStats.gamesPlayed) * 100;
    }
    
    /**
     * 時間詳細統計の更新
     */
    updateTimeDetailStats() {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
        const yearKey = now.getFullYear().toString();
        
        const timeStats = this.statistics.timeDetailStats;
        
        // 月別・年別プレイ時間更新
        if (!timeStats.playTimeByMonth[monthKey]) {
            timeStats.playTimeByMonth[monthKey] = 0;
        }
        if (!timeStats.playTimeByYear[yearKey]) {
            timeStats.playTimeByYear[yearKey] = 0;
        }
        
        const sessionTime = Date.now() - this.sessionStats.sessionStartTime;
        timeStats.playTimeByMonth[monthKey] += sessionTime;
        timeStats.playTimeByYear[yearKey] += sessionTime;
        
        // ピーク時間・曜日更新
        timeStats.peakHour = this.statistics.playTimeByHour.indexOf(
            Math.max(...this.statistics.playTimeByHour)
        );
        timeStats.peakDay = this.statistics.playTimeByDay.indexOf(
            Math.max(...this.statistics.playTimeByDay)
        );
    }
    
    /**
     * 進歩詳細統計の更新
     */
    updateProgressDetailStats(score, playTime) {
        const progressStats = this.statistics.progressDetailStats;
        
        // AP獲得率更新
        if (this.statistics.totalPlayTime > 0) {
            progressStats.apEarningRate = 
                this.statistics.apEarned / (this.statistics.totalPlayTime / 3600000); // 時間あたり
        }
        
        // 支出効率更新
        if (this.statistics.apSpent > 0) {
            progressStats.spendingEfficiency = 
                this.statistics.totalScore / this.statistics.apSpent;
        }
        
        // スコア向上トレンド更新（簡易版）
        if (this.statistics.totalGamesPlayed > 1) {
            const currentAvg = this.statistics.averageScore;
            const previousAvg = (this.statistics.totalScore - score) / (this.statistics.totalGamesPlayed - 1);
            
            if (currentAvg > previousAvg * 1.1) {
                progressStats.growthTrends.scoreImprovement.trend = 'improving';
            } else if (currentAvg < previousAvg * 0.9) {
                progressStats.growthTrends.scoreImprovement.trend = 'declining';
            } else {
                progressStats.growthTrends.scoreImprovement.trend = 'stable';
            }
        }
    }
    
    /**
     * 泡が割れた時の統計更新
     */
    onBubblePopped(bubbleType, reactionTime) {
        this.statistics.bubbleTypeStats[bubbleType]++;
        
        // 反応時間統計の更新
        if (reactionTime) {
            this.updateReactionTimeStats(reactionTime);
        }
        
        // 効率統計の更新
        this.updateEfficiencyStats();
        
        // StatisticsCollectorでのイベント収集
        if (this.collector) {
            this.collector.collectBubbleEvent('bubble_popped', {
                type: bubbleType,
                reactionTime: reactionTime,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * 反応時間統計の更新
     */
    updateReactionTimeStats(reactionTime) {
        const rtStats = this.statistics.reactionTimeStats;
        
        // 基本統計更新
        const currentAvg = this.statistics.averageReactionTime;
        const totalBubbles = this.statistics.totalBubblesPopped;
        this.statistics.averageReactionTime = 
            (currentAvg * (totalBubbles - 1) + reactionTime) / totalBubbles;
        
        // 詳細統計更新
        rtStats.average = this.statistics.averageReactionTime;
        rtStats.fastest = Math.min(rtStats.fastest, reactionTime);
        rtStats.slowest = Math.max(rtStats.slowest, reactionTime);
        
        // 分布統計更新
        if (reactionTime < 200) {
            rtStats.distribution.under_200ms++;
        } else if (reactionTime < 500) {
            rtStats.distribution['200_500ms']++;
        } else if (reactionTime < 1000) {
            rtStats.distribution['500_1000ms']++;
        } else {
            rtStats.distribution.over_1000ms++;
        }
        
        // 最新の反応時間履歴更新
        rtStats.recentTimes.push(reactionTime);
        if (rtStats.recentTimes.length > 100) {
            rtStats.recentTimes.shift();
        }
    }
    
    /**
     * 効率統計の更新
     */
    updateEfficiencyStats() {
        const effStats = this.statistics.efficiencyStats;
        const playTimeMinutes = this.statistics.totalPlayTime / 60000;
        
        if (playTimeMinutes > 0) {
            effStats.bubblesPerMinute = this.statistics.totalBubblesPopped / playTimeMinutes;
            effStats.bubblesPerSecond = this.statistics.totalBubblesPopped / (this.statistics.totalPlayTime / 1000);
            effStats.peakEfficiency = Math.max(effStats.peakEfficiency, effStats.bubblesPerMinute);
        }
        
        // セッション効率の記録
        if (this.gameStartTime) {
            const sessionTime = Date.now() - this.gameStartTime;
            const sessionBubbles = this.sessionStats.bubblesThisSession;
            if (sessionTime > 0) {
                const sessionEfficiency = (sessionBubbles / (sessionTime / 60000));
                effStats.bestEfficiencySession = Math.max(effStats.bestEfficiencySession, sessionEfficiency);
                effStats.worstEfficiencySession = Math.min(effStats.worstEfficiencySession, sessionEfficiency);
            }
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
                completionRate: this.statistics.stagesCompleted / (this.statistics.stagesCompleted + this.statistics.stagesFailed) * 100,
                longestSession: this.formatTime(this.statistics.longestSession),
                shortestSession: this.formatTime(this.statistics.shortestSession),
                averageSessionLength: this.formatTime(this.statistics.averageSessionLength),
                scoreDistribution: this.statistics.scoreDistribution
            },
            
            // 泡統計
            bubbles: {
                totalPopped: this.statistics.totalBubblesPopped,
                totalMissed: this.statistics.totalBubblesMissed,
                accuracy: this.statistics.bubbleAccuracy.toFixed(1) + '%',
                typeBreakdown: this.statistics.bubbleTypeStats,
                favoriteType: this.getFavoriteBubbleType(),
                averageReactionTime: this.statistics.averageReactionTime.toFixed(0) + 'ms',
                efficiencyStats: this.statistics.efficiencyStats,
                reactionTimeStats: this.statistics.reactionTimeStats
            },
            
            // コンボ統計
            combos: {
                highestCombo: this.statistics.highestCombo,
                averageCombo: this.statistics.averageCombo.toFixed(1),
                totalCombos: this.statistics.totalCombos,
                comboBreaks: this.statistics.comboBreaks,
                comboSuccessRate: ((this.statistics.totalCombos - this.statistics.comboBreaks) / this.statistics.totalCombos * 100).toFixed(1) + '%',
                comboDetailStats: this.statistics.comboDetailStats
            },
            
            // HP統計
            health: {
                totalDamageTaken: this.statistics.totalDamageTaken,
                totalHpHealed: this.statistics.totalHpHealed,
                timesRevived: this.statistics.timesRevived,
                lowHpTime: this.formatTime(this.statistics.lowHpTime),
                survivalRate: (this.statistics.stagesCompleted / this.statistics.totalGamesPlayed * 100).toFixed(1) + '%',
                hpDetailStats: this.statistics.hpDetailStats
            },
            
            // ステージ統計
            stages: {
                completed: this.statistics.stagesCompleted,
                failed: this.statistics.stagesFailed,
                stageBreakdown: this.statistics.stageStats,
                favoriteStage: this.getFavoriteStage(),
                stageDetailStats: this.statistics.stageDetailStats
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
                phantomPhases: this.statistics.phantomPhases,
                specialEffectDetailStats: this.statistics.specialEffectDetailStats
            },
            
            // プレイスタイル統計
            playstyle: {
                clicksPerMinute: this.calculateClicksPerMinute(),
                dragOperations: this.statistics.dragOperations,
                perfectGames: this.statistics.perfectGames,
                playTimeDistribution: this.getPlayTimeDistribution(),
                playStyleDetailStats: this.statistics.playStyleDetailStats
            },
            
            // 時間統計
            timeStats: {
                playTimeByHour: this.statistics.playTimeByHour,
                playTimeByDay: this.statistics.playTimeByDay,
                timeDetailStats: this.statistics.timeDetailStats,
                peakPlayingTimes: this.getPeakPlayingTimes()
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
                    (this.statistics.totalScore / this.statistics.apEarned).toFixed(2) : 0,
                progressDetailStats: this.statistics.progressDetailStats
            },
            
            // エラー・システム統計
            system: {
                errorStats: this.statistics.errorStats,
                collectorStats: this.collector ? this.collector.getCollectorStatistics() : null
            },
            
            // ソーシャル統計（将来の機能用）
            social: {
                socialStats: this.statistics.socialStats
            },
            
            // 時系列統計
            timeSeries: {
                available: !!this.timeSeriesManager,
                summary: this.getTimeSeriesStatisticsSummary(),
                growthTrends: this.analyzeGrowthTrends(),
                recentPerformance: this.getRecentPerformance()
            },
            
            // 分析機能
            analysis: {
                available: this.isAnalysisAvailable(),
                capabilities: {
                    trendAnalysis: !!this.analyzer,
                    comparisonAnalysis: !!this.analyzer,
                    insightGeneration: !!this.analyzer,
                    performanceScoring: !!this.analyzer
                }
            }
        };
    }
    
    /**
     * ピークプレイング時間の取得
     */
    getPeakPlayingTimes() {
        const hourNames = [
            '0時', '1時', '2時', '3時', '4時', '5時', '6時', '7時', '8時', '9時', '10時', '11時',
            '12時', '13時', '14時', '15時', '16時', '17時', '18時', '19時', '20時', '21時', '22時', '23時'
        ];
        
        const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        
        return {
            peakHour: {
                hour: this.statistics.timeDetailStats.peakHour,
                name: hourNames[this.statistics.timeDetailStats.peakHour],
                playTime: this.statistics.playTimeByHour[this.statistics.timeDetailStats.peakHour]
            },
            peakDay: {
                day: this.statistics.timeDetailStats.peakDay,
                name: dayNames[this.statistics.timeDetailStats.peakDay],
                playTime: this.statistics.playTimeByDay[this.statistics.timeDetailStats.peakDay]
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
    /**
     * 拡張データ永続化機能
     */
    async save(options = {}) {
        try {
            // 保存オプションの設定
            const saveOptions = {
                includeTimeSeriesData: true,
                createBackup: true,
                validateIntegrity: true,
                compress: false,
                ...options
            };
            
            // データ整合性の事前チェック
            if (saveOptions.validateIntegrity) {
                const validation = this.validateStatistics();
                if (!validation.isValid) {
                    console.warn('Statistics validation failed before save:', validation.errors);
                    // 修復を試行
                    this.repairStatistics(validation.errors);
                }
            }
            
            // メインデータの保存
            const saveData = await this.prepareSaveData(saveOptions);
            
            // バックアップの作成
            if (saveOptions.createBackup) {
                await this.createBackup();
            }
            
            // メインデータの保存実行
            await this.performSave(saveData, saveOptions);
            
            // 時系列データの保存
            if (saveOptions.includeTimeSeriesData && this.timeSeriesManager) {
                await this.saveTimeSeriesData();
            }
            
            // 保存メタデータの更新
            this.updateSaveMetadata();
            
            console.debug('Statistics saved successfully');
            return { success: true, timestamp: Date.now() };
            
        } catch (error) {
            console.error('Failed to save statistics:', error);
            
            // 保存失敗時の処理
            await this.handleSaveFailure(error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 拡張データ読み込み機能
     */
    async load(options = {}) {
        try {
            // 読み込みオプションの設定
            const loadOptions = {
                includeTimeSeriesData: true,
                validateIntegrity: true,
                useBackupOnFailure: true,
                mergeStrategy: 'replace', // 'replace', 'merge', 'preserve'
                ...options
            };
            
            // メインデータの読み込み
            const loadResult = await this.performLoad(loadOptions);
            
            if (!loadResult.success && loadOptions.useBackupOnFailure) {
                console.warn('Main data load failed, attempting backup restore');
                const backupResult = await this.restoreFromBackup();
                if (backupResult.success) {
                    return backupResult;
                }
            }
            
            if (loadResult.success) {
                // データの統合
                this.integrateLoadedData(loadResult.data, loadOptions.mergeStrategy);
                
                // 時系列データの読み込み
                if (loadOptions.includeTimeSeriesData && this.timeSeriesManager) {
                    await this.loadTimeSeriesData();
                }
                
                // データ整合性チェック
                if (loadOptions.validateIntegrity) {
                    const validation = this.validateStatistics();
                    if (!validation.isValid) {
                        console.warn('Loaded data validation failed:', validation.errors);
                        this.repairStatistics(validation.errors);
                    }
                }
                
                console.debug('Statistics loaded successfully');
                return { success: true, timestamp: Date.now() };
            }
            
            // すべての読み込みが失敗した場合
            console.error('All data load attempts failed, using default statistics');
            this.statistics = this.initializeStatistics();
            return { success: false, fallbackUsed: true };
            
        } catch (error) {
            console.error('Failed to load statistics:', error);
            this.statistics = this.initializeStatistics();
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 保存データの準備
     */
    async prepareSaveData(options) {
        const saveData = {
            version: '2.0',
            timestamp: Date.now(),
            statistics: { ...this.statistics },
            metadata: {
                saveOptions: options,
                dataVersion: this.getDataVersion(),
                integrity: this.calculateDataIntegrity(),
                environment: this.getEnvironmentInfo()
            }
        };
        
        // データの圧縮
        if (options.compress && this.compressionManager) {
            try {
                const compressed = await this.compressionManager.compressData(
                    saveData.statistics, 'statistics', { level: 3 }
                );
                if (compressed.compressed) {
                    saveData.statistics = compressed.data;
                    saveData.metadata.compressed = true;
                    saveData.metadata.compressionInfo = compressed.info;
                }
            } catch (error) {
                console.warn('Data compression failed, saving uncompressed:', error);
            }
        }
        
        return saveData;
    }
    
    /**
     * 保存の実行
     */
    async performSave(saveData, options) {
        // メインストレージへの保存
        try {
            const dataString = JSON.stringify(saveData);
            
            // サイズチェック
            if (dataString.length > 5 * 1024 * 1024) { // 5MB制限
                throw new Error(`Save data too large: ${dataString.length} bytes`);
            }
            
            localStorage.setItem('bubblePop_statistics_v2', dataString);
            
            // 冗長保存（複数キー）
            const backupKeys = ['bubblePop_stats_backup1', 'bubblePop_stats_backup2'];
            for (let i = 0; i < backupKeys.length; i++) {
                try {
                    localStorage.setItem(backupKeys[i], dataString);
                } catch (error) {
                    console.warn(`Failed to create redundant save ${i + 1}:`, error);
                }
            }
            
        } catch (error) {
            // LocalStorage容量不足等の処理
            if (error.name === 'QuotaExceededError') {
                await this.handleStorageQuotaExceeded();
                throw new Error('Storage quota exceeded');
            }
            throw error;
        }
    }
    
    /**
     * 読み込みの実行
     */
    async performLoad(options) {
        // 新形式での読み込み試行
        try {
            const savedData = localStorage.getItem('bubblePop_statistics_v2');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // データバージョンの確認
                if (data.version && this.isCompatibleVersion(data.version)) {
                    // 圧縮データの解凍
                    if (data.metadata?.compressed && this.compressionManager) {
                        data.statistics = await this.compressionManager.decompressData(
                            data.statistics, data.metadata.compressionInfo
                        );
                    }
                    
                    return { success: true, data: data };
                }
            }
        } catch (error) {
            console.warn('Failed to load v2 data format:', error);
        }
        
        // 旧形式での読み込み試行
        try {
            const legacyData = localStorage.getItem('bubblePop_statistics');
            if (legacyData) {
                const data = JSON.parse(legacyData);
                console.info('Loaded legacy data format, will upgrade on next save');
                return { success: true, data: { statistics: data, legacy: true } };
            }
        } catch (error) {
            console.warn('Failed to load legacy data format:', error);
        }
        
        // 冗長保存からの復旧試行
        const backupKeys = ['bubblePop_stats_backup1', 'bubblePop_stats_backup2'];
        for (const key of backupKeys) {
            try {
                const backupData = localStorage.getItem(key);
                if (backupData) {
                    const data = JSON.parse(backupData);
                    console.info(`Restored from redundant save: ${key}`);
                    return { success: true, data: data };
                }
            } catch (error) {
                console.warn(`Failed to load from ${key}:`, error);
            }
        }
        
        return { success: false };
    }
    
    /**
     * 読み込みデータの統合
     */
    integrateLoadedData(loadedData, mergeStrategy) {
        const sourceStats = loadedData.legacy ? loadedData.statistics : loadedData.statistics;
        
        switch (mergeStrategy) {
            case 'replace':
                this.statistics = { ...this.initializeStatistics(), ...sourceStats };
                break;
                
            case 'merge':
                this.statistics = this.deepMergeStatistics(this.statistics, sourceStats);
                break;
                
            case 'preserve':
                // 既存データを保持し、新しいフィールドのみ追加
                const defaultStats = this.initializeStatistics();
                Object.keys(defaultStats).forEach(key => {
                    if (this.statistics[key] === undefined && sourceStats[key] !== undefined) {
                        this.statistics[key] = sourceStats[key];
                    }
                });
                break;
        }
    }
    
    /**
     * 深いマージ機能
     */
    deepMergeStatistics(target, source) {
        const result = { ...target };
        
        Object.keys(source).forEach(key => {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMergeStatistics(target[key] || {}, source[key]);
            } else if (source[key] !== undefined) {
                result[key] = source[key];
            }
        });
        
        return result;
    }
    
    /**
     * バックアップの作成
     */
    async createBackup() {
        try {
            const backupData = {
                version: '2.0',
                timestamp: Date.now(),
                statistics: { ...this.statistics },
                metadata: {
                    backupType: 'automatic',
                    originalSize: JSON.stringify(this.statistics).length
                }
            };
            
            // 世代管理（最新5世代を保持）
            const backupHistory = this.getBackupHistory();
            backupHistory.unshift({
                timestamp: Date.now(),
                key: `bubblePop_backup_${Date.now()}`
            });
            
            // 古いバックアップの削除
            while (backupHistory.length > 5) {
                const oldBackup = backupHistory.pop();
                try {
                    localStorage.removeItem(oldBackup.key);
                } catch (error) {
                    console.warn('Failed to remove old backup:', error);
                }
            }
            
            // 新しいバックアップの保存
            const backupKey = backupHistory[0].key;
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // バックアップ履歴の保存
            localStorage.setItem('bubblePop_backup_history', JSON.stringify(backupHistory));
            
            console.debug(`Backup created: ${backupKey}`);
            
        } catch (error) {
            console.error('Failed to create backup:', error);
        }
    }
    
    /**
     * バックアップからの復元
     */
    async restoreFromBackup(backupTimestamp = null) {
        try {
            const backupHistory = this.getBackupHistory();
            
            if (backupHistory.length === 0) {
                return { success: false, reason: 'No backups available' };
            }
            
            // 指定されたタイムスタンプのバックアップまたは最新バックアップを使用
            let targetBackup = backupHistory[0];
            if (backupTimestamp) {
                targetBackup = backupHistory.find(b => b.timestamp === backupTimestamp);
                if (!targetBackup) {
                    return { success: false, reason: 'Specified backup not found' };
                }
            }
            
            // バックアップデータの読み込み
            const backupDataString = localStorage.getItem(targetBackup.key);
            if (!backupDataString) {
                return { success: false, reason: 'Backup data not found' };
            }
            
            const backupData = JSON.parse(backupDataString);
            
            // データの整合性チェック
            if (!this.validateBackupData(backupData)) {
                return { success: false, reason: 'Backup data validation failed' };
            }
            
            // バックアップからの復元
            this.statistics = { ...this.initializeStatistics(), ...backupData.statistics };
            
            // データ整合性チェック
            const validation = this.validateStatistics();
            if (!validation.isValid) {
                this.repairStatistics(validation.errors);
            }
            
            console.info(`Statistics restored from backup: ${targetBackup.key}`);
            return { success: true, timestamp: targetBackup.timestamp };
            
        } catch (error) {
            console.error('Failed to restore from backup:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * バックアップ履歴の取得
     */
    getBackupHistory() {
        try {
            const historyData = localStorage.getItem('bubblePop_backup_history');
            return historyData ? JSON.parse(historyData) : [];
        } catch (error) {
            console.warn('Failed to load backup history:', error);
            return [];
        }
    }
    
    /**
     * バックアップデータの検証
     */
    validateBackupData(backupData) {
        // 基本構造の確認
        if (!backupData || typeof backupData !== 'object') {
            return false;
        }
        
        if (!backupData.statistics || typeof backupData.statistics !== 'object') {
            return false;
        }
        
        // 必須フィールドの確認
        const requiredFields = ['gamePlayStats', 'scoreStats', 'bubbleStats'];
        for (const field of requiredFields) {
            if (!backupData.statistics[field]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 時系列データの保存
     */
    async saveTimeSeriesData() {
        if (!this.timeSeriesManager) return;
        
        try {
            const timeSeriesData = await this.timeSeriesManager.exportData();
            localStorage.setItem('bubblePop_timeseries', JSON.stringify({
                version: '1.0',
                timestamp: Date.now(),
                data: timeSeriesData
            }));
        } catch (error) {
            console.error('Failed to save time series data:', error);
        }
    }
    
    /**
     * 時系列データの読み込み
     */
    async loadTimeSeriesData() {
        if (!this.timeSeriesManager) return;
        
        try {
            const savedData = localStorage.getItem('bubblePop_timeseries');
            if (savedData) {
                const data = JSON.parse(savedData);
                await this.timeSeriesManager.importData(data.data);
            }
        } catch (error) {
            console.error('Failed to load time series data:', error);
        }
    }
    
    /**
     * ストレージ容量不足の処理
     */
    async handleStorageQuotaExceeded() {
        try {
            console.warn('Storage quota exceeded, attempting cleanup');
            
            // 古いバックアップの削除
            const backupHistory = this.getBackupHistory();
            while (backupHistory.length > 2) {
                const oldBackup = backupHistory.pop();
                localStorage.removeItem(oldBackup.key);
            }
            localStorage.setItem('bubblePop_backup_history', JSON.stringify(backupHistory));
            
            // 他の古いデータの削除
            const keysToCheck = ['bubblePop_statistics', 'bubblePop_legacy_data'];
            keysToCheck.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            // データ圧縮の強制実行
            if (this.compressionManager) {
                console.info('Forcing data compression due to storage constraints');
                // 次回保存時に圧縮を有効化
            }
            
        } catch (error) {
            console.error('Failed to handle storage quota exceeded:', error);
        }
    }
    
    /**
     * 保存失敗時の処理
     */
    async handleSaveFailure(error) {
        console.error('Save operation failed, attempting recovery');
        
        try {
            // エラータイプに応じた対処
            if (error.name === 'QuotaExceededError') {
                await this.handleStorageQuotaExceeded();
            } else if (error.message.includes('circular')) {
                console.warn('Circular reference detected, cleaning data');
                this.removeCircularReferences();
            }
            
            // 最低限のデータ保存を試行
            const minimalData = {
                gamePlayStats: this.statistics.gamePlayStats,
                scoreStats: this.statistics.scoreStats,
                timestamp: Date.now()
            };
            localStorage.setItem('bubblePop_minimal_backup', JSON.stringify(minimalData));
            
        } catch (recoveryError) {
            console.error('Save failure recovery also failed:', recoveryError);
        }
    }
    
    /**
     * 循環参照の除去
     */
    removeCircularReferences() {
        try {
            // JSON.stringify のテスト
            JSON.stringify(this.statistics);
        } catch (error) {
            console.warn('Circular reference detected, using safe copy');
            this.statistics = JSON.parse(JSON.stringify(this.statistics, this.getCircularReplacer()));
        }
    }
    
    /**
     * 循環参照対応のreplacer関数
     */
    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return {};
                }
                seen.add(value);
            }
            return value;
        };
    }
    
    /**
     * データバージョンの取得
     */
    getDataVersion() {
        return '2.0';
    }
    
    /**
     * バージョン互換性の確認
     */
    isCompatibleVersion(version) {
        const major = parseInt(version.split('.')[0]);
        const currentMajor = parseInt(this.getDataVersion().split('.')[0]);
        return major === currentMajor;
    }
    
    /**
     * データ整合性の計算
     */
    calculateDataIntegrity() {
        const dataString = JSON.stringify(this.statistics);
        let hash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit integer
        }
        return hash.toString(16);
    }
    
    /**
     * 環境情報の取得
     */
    getEnvironmentInfo() {
        return {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: typeof navigator !== 'undefined' ? navigator.language : 'unknown'
        };
    }
    
    /**
     * 保存メタデータの更新
     */
    updateSaveMetadata() {
        this.lastSaveTime = Date.now();
        this.saveCount = (this.saveCount || 0) + 1;
    }
    
    /**
     * 統計の修復
     */
    repairStatistics(errors) {
        try {
            for (const error of errors) {
                switch (error.type) {
                    case 'missing_field':
                        this.repairMissingField(error.field);
                        break;
                    case 'invalid_type':
                        this.repairInvalidType(error.field, error.expected);
                        break;
                    case 'out_of_range':
                        this.repairOutOfRange(error.field, error.min, error.max);
                        break;
                }
            }
            console.info('Statistics repair completed');
        } catch (repairError) {
            console.error('Statistics repair failed:', repairError);
        }
    }
    
    /**
     * 欠損フィールドの修復
     */
    repairMissingField(fieldPath) {
        const pathArray = fieldPath.split('.');
        let current = this.statistics;
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        
        const lastKey = pathArray[pathArray.length - 1];
        if (current[lastKey] === undefined) {
            // デフォルト値を設定
            const defaultStats = this.initializeStatistics();
            const defaultValue = this.getNestedValue(defaultStats, fieldPath);
            current[lastKey] = defaultValue !== undefined ? defaultValue : 0;
        }
    }
    
    /**
     * 不正な型の修復
     */
    repairInvalidType(fieldPath, expectedType) {
        const current = this.getNestedValue(this.statistics, fieldPath);
        if (current !== undefined && typeof current !== expectedType) {
            this.setNestedValue(this.statistics, fieldPath, this.getDefaultValueForType(expectedType));
        }
    }
    
    /**
     * 範囲外値の修復
     */
    repairOutOfRange(fieldPath, min, max) {
        const current = this.getNestedValue(this.statistics, fieldPath);
        if (typeof current === 'number') {
            if (current < min) {
                this.setNestedValue(this.statistics, fieldPath, min);
            } else if (current > max) {
                this.setNestedValue(this.statistics, fieldPath, max);
            }
        }
    }
    
    /**
     * ネストされた値の取得
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * ネストされた値の設定
     */
    setNestedValue(obj, path, value) {
        const pathArray = path.split('.');
        let current = obj;
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        
        current[pathArray[pathArray.length - 1]] = value;
    }
    
    /**
     * 型のデフォルト値取得
     */
    getDefaultValueForType(type) {
        switch (type) {
            case 'number': return 0;
            case 'string': return '';
            case 'boolean': return false;
            case 'object': return {};
            case 'array': return [];
            default: return null;
        }
    }
    
    /**
     * 統計データの整合性チェック
     */
    validateStatistics() {
        try {
            // 基本統計の検証
            if (this.statistics.totalGamesPlayed < 0) {
                this.statistics.totalGamesPlayed = 0;
            }
            
            if (this.statistics.totalPlayTime < 0) {
                this.statistics.totalPlayTime = 0;
            }
            
            if (this.statistics.totalScore < 0) {
                this.statistics.totalScore = 0;
            }
            
            // 泡統計の検証
            if (this.statistics.totalBubblesPopped < 0) {
                this.statistics.totalBubblesPopped = 0;
            }
            
            if (this.statistics.totalBubblesMissed < 0) {
                this.statistics.totalBubblesMissed = 0;
            }
            
            // バブル精度の再計算
            const totalBubbles = this.statistics.totalBubblesPopped + this.statistics.totalBubblesMissed;
            if (totalBubbles > 0) {
                this.statistics.bubbleAccuracy = (this.statistics.totalBubblesPopped / totalBubbles) * 100;
            } else {
                this.statistics.bubbleAccuracy = 0;
            }
            
            // 平均スコアの再計算
            if (this.statistics.totalGamesPlayed > 0) {
                this.statistics.averageScore = this.statistics.totalScore / this.statistics.totalGamesPlayed;
            } else {
                this.statistics.averageScore = 0;
            }
            
            // 新規統計項目の初期化チェック
            if (!this.statistics.scoreDistribution) {
                this.statistics.scoreDistribution = {
                    '0-1000': 0,
                    '1001-5000': 0,
                    '5001-10000': 0,
                    '10001-25000': 0,
                    '25001-50000': 0,
                    '50001+': 0
                };
            }
            
            if (!this.statistics.efficiencyStats) {
                this.statistics.efficiencyStats = {
                    bubblesPerMinute: 0,
                    bubblesPerSecond: 0,
                    peakEfficiency: 0,
                    efficiencyTrend: [],
                    bestEfficiencySession: 0,
                    worstEfficiencySession: Infinity
                };
            }
            
            if (!this.statistics.reactionTimeStats) {
                this.statistics.reactionTimeStats = {
                    average: 0,
                    fastest: Infinity,
                    slowest: 0,
                    distribution: {
                        'under_200ms': 0,
                        '200_500ms': 0,
                        '500_1000ms': 0,
                        'over_1000ms': 0
                    },
                    recentTimes: []
                };
            }
            
            if (!this.statistics.comboDetailStats) {
                this.statistics.comboDetailStats = {
                    comboRanges: {
                        '1-5': 0,
                        '6-10': 0,
                        '11-20': 0,
                        '21-50': 0,
                        '51+': 0
                    },
                    comboSuccessRate: 0,
                    averageComboLength: 0,
                    longestComboStreak: 0,
                    comboRecoveryTime: 0
                };
            }
            
            if (!this.statistics.hpDetailStats) {
                this.statistics.hpDetailStats = {
                    criticalHpEvents: 0,
                    nearDeathRecoveries: 0,
                    perfectHealthGames: 0,
                    averageDamagePerGame: 0,
                    maxDamageInSingleGame: 0,
                    healingEfficiency: 0
                };
            }
            
            if (!this.statistics.stageDetailStats) {
                this.statistics.stageDetailStats = {
                    favoriteStage: null,
                    mostDifficultStage: null,
                    fastestClearTime: {},
                    averageClearTime: {},
                    stageRetryCount: {},
                    stageCompletionRate: {},
                    stagePerfectionRate: {}
                };
            }
            
            if (!this.statistics.playStyleDetailStats) {
                this.statistics.playStyleDetailStats = {
                    clickPattern: {
                        clicksPerMinute: 0,
                        burstClicking: 0,
                        steadyClicking: 0,
                        pauseFrequency: 0
                    },
                    strategyAnalysis: {
                        priorityTargeting: 0,
                        comboFocus: 0,
                        survivalFocus: 0
                    },
                    adaptability: {
                        difficultyAdjustment: 0,
                        learningCurve: 0,
                        consistencyScore: 0
                    },
                    mouseMovementStats: {
                        totalDistance: 0,
                        averageSpeed: 0,
                        accuracyRatio: 0
                    }
                };
            }
            
            if (!this.statistics.timeDetailStats) {
                this.statistics.timeDetailStats = {
                    playTimeByMonth: {},
                    playTimeByYear: {},
                    peakHour: 0,
                    peakDay: 0,
                    playingStreaks: {
                        currentStreak: 0,
                        longestStreak: 0,
                        streakHistory: []
                    },
                    sessionGaps: {
                        averageGap: 0,
                        longestGap: 0,
                        shortestGap: Infinity
                    }
                };
            }
            
            if (!this.statistics.progressDetailStats) {
                this.statistics.progressDetailStats = {
                    apEarningRate: 0,
                    spendingEfficiency: 0,
                    itemUsageStats: {},
                    achievementProgress: {},
                    milestones: [],
                    growthTrends: {
                        scoreImprovement: {
                            daily: 0,
                            weekly: 0,
                            monthly: 0,
                            trend: 'stable'
                        },
                        skillImprovement: {
                            accuracyImprovement: 0,
                            speedImprovement: 0,
                            consistencyImprovement: 0
                        }
                    }
                };
            }
            
            if (!this.statistics.errorStats) {
                this.statistics.errorStats = {
                    gameErrors: 0,
                    performanceIssues: 0,
                    connectionIssues: 0,
                    recoverySuccessRate: 0
                };
            }
            
            if (!this.statistics.socialStats) {
                this.statistics.socialStats = {
                    shareCount: 0,
                    challengesCompleted: 0,
                    communityRank: 0,
                    friendsConnected: 0
                };
            }
            
        } catch (error) {
            console.error('Statistics validation failed:', error);
            // 検証失敗時は統計を初期化
            this.statistics = this.initializeStatistics();
        }
    }
    
    /**
     * 時系列データの記録
     */
    recordTimeSeriesData(score, playTime, completed) {
        if (!this.timeSeriesManager) return;
        
        const timestamp = Date.now();
        
        // 基本的な時系列データポイントを記録
        this.timeSeriesManager.addDataPoint(timestamp, 'score', score, {
            completed: completed,
            sessionId: this.generateSessionId()
        });
        
        this.timeSeriesManager.addDataPoint(timestamp, 'playTime', playTime, {
            completed: completed,
            sessionId: this.generateSessionId()
        });
        
        this.timeSeriesManager.addDataPoint(timestamp, 'bubblesPopped', 
            this.sessionStats.bubblesThisSession, {
            completed: completed,
            sessionId: this.generateSessionId()
        });
        
        // 効率統計の記録
        const efficiency = playTime > 0 ? (this.sessionStats.bubblesThisSession / (playTime / 60000)) : 0;
        this.timeSeriesManager.addDataPoint(timestamp, 'efficiency', efficiency, {
            completed: completed,
            sessionId: this.generateSessionId()
        });
        
        // 精度統計の記録
        const sessionAccuracy = this.calculateSessionAccuracy();
        this.timeSeriesManager.addDataPoint(timestamp, 'accuracy', sessionAccuracy, {
            completed: completed,
            sessionId: this.generateSessionId()
        });
    }
    
    /**
     * 時系列データの取得
     */
    getTimeSeriesData(period, category = null, startDate = null, endDate = null) {
        if (!this.timeSeriesManager) return [];
        
        return this.timeSeriesManager.getTimeSeriesData(period, category, startDate, endDate);
    }
    
    /**
     * 集計時系列データの取得
     */
    getAggregatedTimeSeriesData(category, period, aggregationType = 'sum') {
        if (!this.timeSeriesManager) return [];
        
        return this.timeSeriesManager.getAggregatedData(category, period, aggregationType);
    }
    
    /**
     * 期間比較分析
     */
    compareTimePeriods(category, period1, period2) {
        if (!this.timeSeriesManager) return null;
        
        return this.timeSeriesManager.comparePerformance(category, period1, period2);
    }
    
    /**
     * 成長トレンドの分析
     */
    analyzeGrowthTrends(categories = ['score', 'efficiency', 'accuracy']) {
        if (!this.timeSeriesManager) return {};
        
        const trends = {};
        
        categories.forEach(category => {
            const dailyData = this.timeSeriesManager.getAggregatedData(category, 'daily', 'average');
            const weeklyData = this.timeSeriesManager.getAggregatedData(category, 'weekly', 'average');
            const monthlyData = this.timeSeriesManager.getAggregatedData(category, 'monthly', 'average');
            
            trends[category] = {
                daily: this.calculateTrendFromData(dailyData.slice(-7)), // 最新7日
                weekly: this.calculateTrendFromData(weeklyData.slice(-4)), // 最新4週
                monthly: this.calculateTrendFromData(monthlyData.slice(-3)), // 最新3ヶ月
                overall: this.calculateOverallTrend(dailyData)
            };
        });
        
        return trends;
    }
    
    /**
     * データからのトレンド計算
     */
    calculateTrendFromData(data) {
        if (data.length < 2) return { trend: 'stable', change: 0, changePercent: 0 };
        
        const first = data[0].value;
        const last = data[data.length - 1].value;
        const change = last - first;
        const changePercent = first > 0 ? (change / first) * 100 : 0;
        
        let trend = 'stable';
        if (changePercent > 5) {
            trend = 'improving';
        } else if (changePercent < -5) {
            trend = 'declining';
        }
        
        return {
            trend: trend,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            dataPoints: data.length
        };
    }
    
    /**
     * 全体的なトレンドの計算
     */
    calculateOverallTrend(data) {
        if (data.length < 10) return this.calculateTrendFromData(data);
        
        // 直近30%と最初30%を比較
        const recentSize = Math.ceil(data.length * 0.3);
        const recent = data.slice(-recentSize);
        const early = data.slice(0, recentSize);
        
        const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
        const earlyAvg = early.reduce((sum, item) => sum + item.value, 0) / early.length;
        
        const change = recentAvg - earlyAvg;
        const changePercent = earlyAvg > 0 ? (change / earlyAvg) * 100 : 0;
        
        let trend = 'stable';
        if (changePercent > 10) {
            trend = 'improving';
        } else if (changePercent < -10) {
            trend = 'declining';
        }
        
        return {
            trend: trend,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            dataPoints: data.length,
            analysisMethod: 'overall_comparison'
        };
    }
    
    /**
     * セッション精度の計算
     */
    calculateSessionAccuracy() {
        // セッション中の精度を計算（簡易版）
        const sessionBubbles = this.sessionStats.bubblesThisSession;
        if (sessionBubbles === 0) return 0;
        
        // 現在のセッションでの推定ミス数（簡易計算）
        const estimatedMisses = Math.max(0, sessionBubbles * 0.1); // 仮の計算
        return sessionBubbles > 0 ? (sessionBubbles / (sessionBubbles + estimatedMisses)) * 100 : 0;
    }
    
    /**
     * セッションIDの生成
     */
    generateSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }
    
    /**
     * 時系列統計サマリーの取得
     */
    getTimeSeriesStatisticsSummary() {
        if (!this.timeSeriesManager) return null;
        
        const summary = this.timeSeriesManager.getStatisticsSummary();
        const trends = this.analyzeGrowthTrends();
        
        return {
            ...summary,
            growthTrends: trends,
            recentPerformance: this.getRecentPerformance(),
            timeSeriesAvailable: true
        };
    }
    
    /**
     * 最近のパフォーマンス取得
     */
    getRecentPerformance() {
        if (!this.timeSeriesManager) return {};
        
        const categories = ['score', 'efficiency', 'accuracy', 'playTime'];
        const performance = {};
        
        categories.forEach(category => {
            const recentData = this.timeSeriesManager.getAggregatedData(category, 'daily', 'average').slice(-7);
            if (recentData.length > 0) {
                const values = recentData.map(item => item.value);
                performance[category] = {
                    average: values.reduce((sum, val) => sum + val, 0) / values.length,
                    best: Math.max(...values),
                    worst: Math.min(...values),
                    trend: recentData[recentData.length - 1].trend,
                    dataPoints: recentData.length
                };
            }
        });
        
        return performance;
    }
    
    /**
     * 包括的分析の実行
     */
    async performComprehensiveAnalysis(options = {}) {
        if (!this.analyzer) return null;
        
        return await this.analyzer.performComprehensiveAnalysis(options);
    }
    
    /**
     * トレンド分析の実行
     */
    async performTrendAnalysis(options = {}) {
        if (!this.analyzer) return null;
        
        return await this.analyzer.performTrendAnalysis(options);
    }
    
    /**
     * 洞察生成の実行
     */
    async generateInsights(options = {}) {
        if (!this.analyzer) return null;
        
        const detailedStats = this.getDetailedStatistics();
        return await this.analyzer.generateInsights(detailedStats, options);
    }
    
    /**
     * パフォーマンススコアの取得
     */
    async getPerformanceScore() {
        if (!this.analyzer) return 0;
        
        const analysis = await this.performComprehensiveAnalysis();
        return analysis && analysis.integratedAnalysis ? 
            analysis.integratedAnalysis.overallPerformanceScore : 0;
    }
    
    /**
     * 統計分析が利用可能かチェック
     */
    isAnalysisAvailable() {
        return !!this.analyzer;
    }
    
    /**
     * データをリセット
     */
    reset() {
        this.statistics = this.initializeStatistics();
        this.sessionStats = this.initializeSessionStats();
        
        // 時系列データもリセット
        if (this.timeSeriesManager) {
            this.timeSeriesManager.reset();
        }
        
        this.save();
    }

    /**
     * テストデータのインポート（デバッグツール用）
     */
    importTestData(testData, options = {}) {
        try {
            if (!Array.isArray(testData)) {
                console.warn('Test data must be an array');
                return false;
            }

            const importMode = options.mode || 'append'; // 'append', 'replace', 'merge'
            
            if (importMode === 'replace') {
                // 既存データを置き換え
                this.reset();
            }

            let importedCount = 0;
            const currentTime = Date.now();

            for (const dataEntry of testData) {
                try {
                    // データエントリの検証
                    if (!dataEntry.timestamp && !dataEntry.date) {
                        console.warn('Test data entry missing timestamp/date, using current time');
                        dataEntry.timestamp = currentTime - Math.random() * 86400000; // 24時間以内のランダム時間
                    }

                    // 時系列データとして追加
                    if (this.timeSeriesManager) {
                        this.timeSeriesManager.addDataPoint({
                            timestamp: dataEntry.timestamp || new Date(dataEntry.date).getTime(),
                            data: dataEntry
                        });
                    }

                    // 統計データの更新
                    if (dataEntry.sessionsPlayed) {
                        this.statistics.totalSessions += dataEntry.sessionsPlayed;
                    }
                    if (dataEntry.totalScore) {
                        this.statistics.totalScore += dataEntry.totalScore;
                        this.statistics.highScore = Math.max(this.statistics.highScore, dataEntry.totalScore);
                    }
                    if (dataEntry.bubblesPopped) {
                        this.statistics.totalBubblesPopped += dataEntry.bubblesPopped;
                    }
                    if (dataEntry.maxCombo) {
                        this.statistics.bestCombo = Math.max(this.statistics.bestCombo, dataEntry.maxCombo);
                    }
                    if (dataEntry.playtimeMinutes) {
                        this.statistics.totalPlayTime += dataEntry.playtimeMinutes * 60 * 1000; // ミリ秒に変換
                    }
                    if (dataEntry.achievements) {
                        this.statistics.achievementUnlocks += dataEntry.achievements;
                    }

                    importedCount++;

                } catch (entryError) {
                    console.warn('Failed to import test data entry:', entryError, dataEntry);
                }
            }

            // 平均値の再計算
            if (this.statistics.totalSessions > 0) {
                this.statistics.averageScore = Math.floor(this.statistics.totalScore / this.statistics.totalSessions);
                this.statistics.averagePlayTime = Math.floor(this.statistics.totalPlayTime / this.statistics.totalSessions);
            }

            // データの保存
            this.save();

            console.log(`Imported ${importedCount} test statistics entries`);
            return { success: true, imported: importedCount, total: testData.length };

        } catch (error) {
            console.error('Failed to import test data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * テスト統計データの生成
     */
    generateTestStatistics(profile = 'normal', options = {}) {
        const profiles = {
            beginner: {
                sessions: Math.floor(Math.random() * 20) + 5,
                averageScore: Math.floor(Math.random() * 500) + 100,
                totalPlaytime: Math.floor(Math.random() * 1800000) + 300000, // 5-35分
                achievements: Math.floor(Math.random() * 5) + 1
            },
            normal: {
                sessions: Math.floor(Math.random() * 100) + 50,
                averageScore: Math.floor(Math.random() * 2000) + 500,
                totalPlaytime: Math.floor(Math.random() * 7200000) + 1800000, // 30-150分
                achievements: Math.floor(Math.random() * 15) + 5
            },
            expert: {
                sessions: Math.floor(Math.random() * 500) + 200,
                averageScore: Math.floor(Math.random() * 10000) + 2000,
                totalPlaytime: Math.floor(Math.random() * 36000000) + 7200000, // 2-12時間
                achievements: Math.floor(Math.random() * 50) + 20
            }
        };

        const baseProfile = profiles[profile] || profiles.normal;
        const testStats = { ...baseProfile, ...options };

        // 現在の統計に適用
        this.statistics.totalSessions += testStats.sessions;
        this.statistics.totalScore += testStats.averageScore * testStats.sessions;
        this.statistics.averageScore = Math.floor(this.statistics.totalScore / this.statistics.totalSessions);
        this.statistics.totalPlayTime += testStats.totalPlaytime;
        this.statistics.averagePlayTime = Math.floor(this.statistics.totalPlayTime / this.statistics.totalSessions);
        this.statistics.achievementUnlocks += testStats.achievements;

        this.save();
        return testStats;
    }

    /**
     * テスト統計データのクリア
     */
    clearTestData() {
        const backup = {
            statistics: { ...this.statistics },
            sessionStats: { ...this.sessionStats }
        };

        this.reset();
        
        console.log('Test statistics data cleared');
        return backup;
    }

    /**
     * テスト統計データの検証
     */
    validateTestData(testData) {
        const errors = [];
        
        if (!Array.isArray(testData)) {
            errors.push('Test data must be an array');
            return { valid: false, errors };
        }

        for (let i = 0; i < testData.length; i++) {
            const entry = testData[i];
            const entryErrors = [];

            if (typeof entry !== 'object' || entry === null) {
                entryErrors.push('Entry must be an object');
            } else {
                // 数値フィールドの検証
                const numericFields = ['sessionsPlayed', 'totalScore', 'bubblesPopped', 'maxCombo', 'playtimeMinutes', 'achievements'];
                for (const field of numericFields) {
                    if (entry[field] !== undefined && (typeof entry[field] !== 'number' || entry[field] < 0)) {
                        entryErrors.push(`${field} must be a non-negative number`);
                    }
                }

                // 日時フィールドの検証
                if (entry.timestamp !== undefined && (typeof entry.timestamp !== 'number' || entry.timestamp < 0)) {
                    entryErrors.push('timestamp must be a non-negative number');
                }
                if (entry.date !== undefined && isNaN(new Date(entry.date).getTime())) {
                    entryErrors.push('date must be a valid date string');
                }
            }

            if (entryErrors.length > 0) {
                errors.push(`Entry ${i}: ${entryErrors.join(', ')}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            entryCount: testData.length
        };
    }
}